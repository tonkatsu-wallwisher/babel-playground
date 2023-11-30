import _ from 'lodash'

let a = 0
let b = 1
let c = 2

if (!(a === 1 || b === 1 || c === 1)) {
  console.log('a, b, c are not 1')
}

const arr = [1, 2, 2, 3, 4]
console.log(_.map(arr, (x) => x * 2))
;(function () {
  console.log(_.uniq(arr))
})()

function foo() {
  console.log(
    'mapped array',
    _.map(arr, (x) => x * 2),
  )
}
