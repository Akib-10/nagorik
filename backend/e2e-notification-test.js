// End-to-end verification of the notification pipeline against a live server.
// Run with: node e2e-notification-test.js   (from the backend directory)
const BASE = 'http://localhost:5000/api'

let pass = 0
let fail = 0

function check(name, condition, detail = '') {
  if (condition) {
    pass += 1
    console.log(`  PASS  ${name}`)
  } else {
    fail += 1
    console.log(`  FAIL  ${name}${detail ? ` -> ${detail}` : ''}`)
  }
}

async function call(path, { method = 'GET', token, body } = {}) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  })
  const text = await res.text()
  let data
  try {
    data = JSON.parse(text)
  } catch {
    data = text
  }
  return { status: res.status, data }
}

const stamp = Date.now()
const owner = { name: 'Owner E2E', email: `owner.${stamp}@e2e.test` }
const actor = { name: 'Actor E2E', email: `actor.${stamp}@e2e.test` }
const third = { name: 'Third E2E', email: `third.${stamp}@e2e.test` }

async function register(user) {
  const { status, data } = await call('/auth/register', {
    method: 'POST',
    body: { name: user.name, email: user.email, password: 'Passw0rd!23' },
  })
  if (status !== 201 && status !== 200) {
    throw new Error(`register ${user.email} failed: ${status} ${JSON.stringify(data)}`)
  }
  return data.token
}

async function run() {
  console.log('\n=== 1. Auth setup ===')
  const ownerToken = await register(owner)
  const actorToken = await register(actor)
  const thirdToken = await register(third)
  check('three users registered and token issued', Boolean(ownerToken && actorToken && thirdToken))

  console.log('\n=== 2. Unauthenticated access is rejected ===')
  const noAuth = await call('/notifications')
  check('GET /notifications without token -> 401', noAuth.status === 401, `got ${noAuth.status}`)

  const badAuth = await call('/notifications', { token: 'not-a-real-token' })
  check('GET /notifications with bad token -> 401', badAuth.status === 401, `got ${badAuth.status}`)

  console.log('\n=== 3. Owner creates an issue ===')
  const created = await call('/issues', {
    method: 'POST',
    token: ownerToken,
    body: { title: `E2E Pothole ${stamp}`, description: 'verify notifications', category: 'Roads' },
  })
  check('POST /issues -> 201', created.status === 201, `got ${created.status}`)
  const issueId = created.data._id
  check('issue has an id', Boolean(issueId))

  console.log('\n=== 4. Baseline: owner inbox is empty ===')
  const empty = await call('/notifications?filter=all', { token: ownerToken })
  check('GET /notifications -> 200', empty.status === 200, `got ${empty.status}`)
  check('response exposes items array', Array.isArray(empty.data.items))
  check('response exposes unreadCount', typeof empty.data.unreadCount === 'number')
  check('response exposes totalPages', typeof empty.data.totalPages === 'number')
  check('owner starts with 0 items', empty.data.items.length === 0, `got ${empty.data.items.length}`)
  check('owner starts with unreadCount 0', empty.data.unreadCount === 0, `got ${empty.data.unreadCount}`)

  console.log('\n=== 5. Upvote triggers a notification ===')
  const up = await call(`/issues/${issueId}/upvote`, { method: 'PATCH', token: actorToken })
  check('PATCH upvote -> 200', up.status === 200, `got ${up.status}`)

  const afterUpvote = await call('/notifications?filter=all', { token: ownerToken })
  check('owner has 1 notification', afterUpvote.data.items.length === 1, `got ${afterUpvote.data.items.length}`)
  const upvoteNote = afterUpvote.data.items[0]
  check('notification type is upvote', upvoteNote.type === 'upvote', `got ${upvoteNote.type}`)
  check('notification is unread', upvoteNote.read === false)
  check('notification carries issueId for routing', upvoteNote.issueId === issueId, `got ${upvoteNote.issueId}`)
  check('notification message names the actor', String(upvoteNote.message).includes('Actor E2E'), `got "${upvoteNote.message}"`)

  console.log('\n=== 6. No self-notification ===')
  const ownerSelf = await call(`/issues/${issueId}/upvote`, { method: 'PATCH', token: ownerToken })
  check('owner can upvote own issue -> 200', ownerSelf.status === 200)
  const afterSelf = await call('/notifications?filter=all', { token: ownerToken })
  check('no self-notification created', afterSelf.data.items.length === 1, `got ${afterSelf.data.items.length}`)

  console.log('\n=== 7. Aggregation: second actor merges, first name retained ===')
  await call(`/issues/${issueId}/upvote`, { method: 'PATCH', token: thirdToken })
  const afterSecond = await call('/notifications?filter=all', { token: ownerToken })
  check('still 1 aggregated notification', afterSecond.data.items.length === 1, `got ${afterSecond.data.items.length}`)
  check('message aggregates both actors', String(afterSecond.data.items[0].message).includes('2 others'), `got "${afterSecond.data.items[0].message}"`)
  check(
    'message leads with the FIRST actor, not the last',
    String(afterSecond.data.items[0].message).startsWith('Actor E2E') && !String(afterSecond.data.items[0].message).startsWith('Third E2E'),
    `got "${afterSecond.data.items[0].message}"`
  )
  check('actorCount is 2', afterSecond.data.items[0].actorCount === 2, `got ${afterSecond.data.items[0].actorCount}`)

  console.log('\n=== 8. Comment triggers a notification with a routable issueId ===')
  const comment = await call(`/comments/issue/${issueId}`, {
    method: 'POST',
    token: thirdToken,
    body: { text: 'I saw this too' },
  })
  check('POST comment -> 201', comment.status === 201, `got ${comment.status}`)

  const afterComment = await call('/notifications?filter=all', { token: ownerToken })
  check('owner now has 2 notifications', afterComment.data.items.length === 2, `got ${afterComment.data.items.length}`)
  const commentNote = afterComment.data.items.find((n) => n.type === 'comment')
  check('comment notification exists', Boolean(commentNote))
  check('comment notification targetType is Comment', commentNote.targetType === 'Comment')
  check(
    'comment notification.issueId resolves to the ISSUE (not the comment)',
    commentNote.issueId === issueId,
    `issueId=${commentNote.issueId} issue=${issueId}`
  )
  check(
    'targetId is the comment id and differs from issueId',
    commentNote.targetId === comment.data._id && commentNote.targetId !== issueId
  )

  console.log('\n=== 9. unread-count endpoint ===')
  const count = await call('/notifications/unread-count', { token: ownerToken })
  check('GET unread-count -> 200', count.status === 200, `got ${count.status}`)
  check('unread-count is 2', count.data.unreadCount === 2, `got ${count.data.unreadCount}`)

  console.log('\n=== 10. Tenant isolation ===')
  const strangerInbox = await call('/notifications?filter=all', { token: actorToken })
  check('other user sees none of these notifications', strangerInbox.data.items.length === 0, `got ${strangerInbox.data.items.length}`)

  const stolenId = upvoteNote._id
  const crossRead = await call(`/notifications/${stolenId}/read`, {
    method: 'PATCH',
    token: actorToken,
    body: { read: true },
  })
  check("another user cannot touch someone else's notification -> 404", crossRead.status === 404, `got ${crossRead.status}`)

  const crossDelete = await call(`/notifications/${stolenId}`, { method: 'DELETE', token: actorToken })
  check("another user cannot delete someone else's notification -> 404", crossDelete.status === 404, `got ${crossDelete.status}`)

  console.log('\n=== 11. Read-state toggle round trip ===')
  const marked = await call(`/notifications/${stolenId}/read`, {
    method: 'PATCH',
    token: ownerToken,
    body: { read: true },
  })
  check('PATCH read -> 200', marked.status === 200, `got ${marked.status}`)
  check('read flag persisted', marked.data.read === true)
  check('readAt is set', Boolean(marked.data.readAt))

  const afterRead = await call('/notifications/unread-count', { token: ownerToken })
  check('unread-count dropped to 1', afterRead.data.unreadCount === 1, `got ${afterRead.data.unreadCount}`)

  const unmarked = await call(`/notifications/${stolenId}/read`, {
    method: 'PATCH',
    token: ownerToken,
    body: { read: false },
  })
  check('can toggle back to unread', unmarked.data.read === false)
  check('readAt cleared on un-read', unmarked.data.readAt === null, `got ${unmarked.data.readAt}`)

  console.log('\n=== 12. read must be a boolean ===')
  const badBody = await call(`/notifications/${stolenId}/read`, {
    method: 'PATCH',
    token: ownerToken,
    body: { read: 'yes-please' },
  })
  check('non-boolean read -> 400', badBody.status === 400, `got ${badBody.status}`)

  console.log('\n=== 13. Server-side filters ===')
  const all = await call('/notifications?filter=all', { token: ownerToken })
  const statusOnly = await call('/notifications?filter=status', { token: ownerToken })
  const activityOnly = await call('/notifications?filter=activity', { token: ownerToken })
  const unreadOnly = await call('/notifications?filter=unread', { token: ownerToken })
  const bogus = await call('/notifications?filter=drop-table', { token: ownerToken })

  check('filter=all returns both', all.data.items.length === 2, `got ${all.data.items.length}`)
  check('filter=status returns 0', statusOnly.data.items.length === 0, `got ${statusOnly.data.items.length}`)
  check('filter=activity returns 2', activityOnly.data.items.length === 2, `got ${activityOnly.data.items.length}`)
  check('filter=unread returns 2', unreadOnly.data.items.length === 2, `got ${unreadOnly.data.items.length}`)
  check('unknown filter falls back to all (no 500)', bogus.status === 200, `got ${bogus.status}`)
  check('unknown filter returns 2', bogus.data.items.length === 2, `got ${bogus.data.items.length}`)

  console.log('\n=== 14. Pagination clamping ===')
  const clamped = await call('/notifications?limit=1000000&page=-5', { token: ownerToken })
  check('hostile limit/page does not 500', clamped.status === 200, `got ${clamped.status}`)
  check('limit clamped to max 50', clamped.data.limit === 50, `got ${clamped.data.limit}`)
  check('negative page clamped to 1', clamped.data.page === 1, `got ${clamped.data.page}`)
  check('clamped query still returns the 2 rows', clamped.data.items.length === 2, `got ${clamped.data.items.length}`)

  const paged = await call('/notifications?limit=1&page=2', { token: ownerToken })
  check('limit=1 page=2 returns 1 item', paged.data.items.length === 1, `got ${paged.data.items.length}`)
  check('totalPages reflects limit', paged.data.totalPages === 2, `got ${paged.data.totalPages}`)

  console.log('\n=== 15. Soft delete ===')
  const target = commentNote._id
  const deleted = await call(`/notifications/${target}`, { method: 'DELETE', token: ownerToken })
  check('DELETE -> 200', deleted.status === 200, `got ${deleted.status}`)
  check('delete returns a string id', typeof deleted.data.id === 'string', `got ${typeof deleted.data.id}`)
  check('delete returns refreshed unreadCount', typeof deleted.data.unreadCount === 'number')

  const afterDelete = await call('/notifications?filter=all', { token: ownerToken })
  check('deleted notification is gone', afterDelete.data.items.length === 1, `got ${afterDelete.data.items.length}`)
  check('soft-deleted row is not resurrected', !afterDelete.data.items.some((n) => n._id === target))

  console.log('\n=== 16. Mark all as read ===')
  const markAll = await call('/notifications/mark-all-read', { method: 'PATCH', token: ownerToken })
  check('mark-all-read -> 200', markAll.status === 200, `got ${markAll.status}`)
  check('mark-all-read reports modified', typeof markAll.data.modified === 'number', `got ${markAll.data.modified}`)

  const afterMarkAll = await call('/notifications/unread-count', { token: ownerToken })
  check('unread-count is 0 after mark-all', afterMarkAll.data.unreadCount === 0, `got ${afterMarkAll.data.unreadCount}`)

  const stillThere = await call('/notifications?filter=all', { token: ownerToken })
  check('mark-all-read does not delete anything', stillThere.data.items.length === 1, `got ${stillThere.data.items.length}`)

  console.log('\n=== 17. Upvote toggle-off emits no new notification ===')
  const before = (await call('/notifications?filter=all', { token: ownerToken })).data.items.length
  await call(`/issues/${issueId}/upvote`, { method: 'PATCH', token: actorToken })
  const after = (await call('/notifications?filter=all', { token: ownerToken })).data.items.length
  check('no notification created on un-upvote', after === before, `before=${before} after=${after}`)

  console.log('\n=== 18. Frontend contract shape ===')
  const contract = await call('/notifications?filter=all&page=1&limit=20', { token: ownerToken })
  const item = contract.data.items[0]
  check('item has _id', Boolean(item._id))
  check('item has type', typeof item.type === 'string')
  check('item has title', typeof item.title === 'string')
  check('item has message', typeof item.message === 'string')
  check('item has createdAt (timeAgo input)', Boolean(item.createdAt))
  check('item has read boolean', typeof item.read === 'boolean')
  check('item exposes targetType', 'targetType' in item)
  check('item exposes issueId used for routing', 'issueId' in item)

  console.log(`\n${'='.repeat(46)}`)
  console.log(`  ${pass} passed, ${fail} failed`)
  console.log(`${'='.repeat(46)}\n`)
  process.exit(fail === 0 ? 0 : 1)
}

run().catch((err) => {
  console.error('\nTEST HARNESS ERROR:', err.message)
  process.exit(1)
})