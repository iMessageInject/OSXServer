const TIMEOUT = 1000 * 60
const CHECK_TIME = 1000 * 10

let task;
let lockData;

module.exports.lock = (remoteAddress) => {
    lockData = {
        address: remoteAddress,
        time: {
            initial: Date.getTime(),
            lastReport: Date.getTime()
        }
    }
    task = setInterval(checkTimeout, CHECK_TIME)
}
module.exports.updateLock = () => lockData.time.lastReport = Date.getTime()
module.exports.getLockData = () => lockData
module.exports.isLocked = () => lockData !== undefined

function checkTimeout() {
    const reportTimeDiff = Date.getTime() - lockData.time.lastReport
    if(reportTimeDiff >= TIMEOUT) {
        clearInterval(task)
        lockData = undefined
        console.log("Remote address " + lockData.address + " timed out after " + ms(reportTimeDiff))
    } else {
        console.log("Remote address " + lockData.address + " continues after " + ms(Date.getTime() - lockData.time.initial))
    }
}