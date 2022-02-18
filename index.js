var net = require('net');
var mysql = require('./mysql.js')
var logger = require('./log.js')
var redis = require('./redis.js')
var PORT = 7002;
let timer = null;
let socketArr = [];
const timePush = [];
// mysql.query('select * from user',(error, results, fields)=>{
//   console.log(results)
// });
// 创建一个TCP服务器实例，调用listen函数开始监听指定端口
// 传入net.createServer()的回调函数将作为”connection“事件的处理函数
// 在每一个“connection”事件中，该回调函数接收到的socket对象是唯一的
net.createServer(function (sock) {
    console.log('服务端：收到来自客户端的请求');
    sock.on('data', function (data) {
        console.log(data, '->');
        if (typeof data !== 'object') {
            return
        }
        let string = data.toString('hex');
        let arr = [];
        for (let i = 0; i < string.length / 2; i++) {
            arr[i] = string.substring(2 * i, 2 * (i + 1));
        }
        let arr1 = arr.map((item) => {
            return '0x' + item;
        })
        const buf = Buffer.from([arr1[0]]);
        let arrlength = parseInt(buf.toString('hex'), 16);
        if (arr1.length != arrlength) {
            return
        }
        const dataBuf = Buffer.from([arr1[4]]);
        let dataLength = parseInt(dataBuf.toString('hex'), 16)
        if (dataLength != arrlength - 6) {
            return
        }
        switch (arr[3]) {
            case '80':
                //登录内容
                try {
                    // 设备号
                    const equipment = result(arr1, 1, 2);
                    //当前时间
                    const newDate = new Date();
                    //设备时间
                    let time = getElementTime(arr1, 6, 7, 8, 9, 10, 11);
                    const oldDate = new Date(time);
                    //  console.log(newDate.getTime(),oldDate.getTime());
                    //  console.log(Math.abs(newDate.getTime()-oldDate.getTime()));
                    //  大于30秒做处理

                    if (Math.abs(newDate.getTime() - oldDate.getTime()) >= 30000) {
                        FnChangeTime(sock, newDate, arr1)
                    }
                } catch (err) {
                    return logger.errorlog.error(err);
                }
                break;
            case '82':
                try {
                    //公司号
                    const bussiness = parseInt(arr1[5], 16);
                    let time = getElementTime(arr1, 11, 12, 13, 14, 15, 16);
                    mysql.getConnection(function (err, connection) {
                        if (err) { 
                           return logger.errorlog.error(err) 
                        }; // not connected!
                        // Use the connection
                        console.log(bussiness);
                        connection.query(`SELECT * FROM bussiness WHERE bussinessNum=${bussiness}`, function (error, results, fields) {
                            // When done with the connection, release it.
                            connection.release();
                            // Handle error after the release.
                            if (error) {
                                logger.errorlog.error(error);
                                return
                            }else{
                                if(results.length>0){

                                }else{
                                  
                                    
                                }
                            }
                        });
                    });
                } catch (err) {
                    return logger.errorlog.error(err);
                }
                break;
            case 'a4':
                try {
                    console.log('a4');
                    const dataBuf = Buffer.from([arr1[4]]);
                    let dataLength = parseInt(dataBuf.toString('hex'), 16)
                    console.log(arrlength, arr1.length)
                    if (dataLength != arrlength - 6) {
                        return
                    }
                    // console.log('数据长度正确');
                    let equipment = result(arr, 1, 2);
                    // console.log('equipment'+equipment);
                    let bottomHoleHeight = result1(arr, 5, 6, 7, 8);
                    // console.log('bottomHoleHeight'+bottomHoleHeight);
                    let truncatedPipeHeight = result(arr, 9, 10);
                    // console.log('truncatedPipeHeight'+truncatedPipeHeight);
                    let groundHeight = result(arr, 11, 12);
                    // console.log('groundHeight'+groundHeight);
                    let sewerageSluice = result(arr, 13, 14);
                    // console.log('sewerageSluice'+sewerageSluice);
                    let sluiceHeight = result(arr, 15, 16);
                    // console.log('sluiceHeight'+sluiceHeight);
                    let stopWaterLevel1 = result(arr, 17, 18);
                    // console.log('stopWaterLevel1'+stopWaterLevel1);
                    let startWaterLevel1 = result(arr, 19, 20);
                    // console.log('startWaterLevel1'+startWaterLevel1);
                    let stopWaterLevel2 = result(arr, 21, 22);
                    // console.log('stopWaterLevel2'+stopWaterLevel2);
                    let startWaterLevel2 = result(arr, 23, 24);
                    // console.log('startWaterLevel2'+startWaterLevel2);
                    let stopWaterLevel3 = result(arr, 25, 26);
                    // console.log('stopWaterLevel3'+stopWaterLevel3);
                    let startWaterLevel3 = result(arr, 27, 28);
                    // console.log('startWaterLevel3'+startWaterLevel3);
                    let ss = result1(arr, 29, 30, 31, 32);
                    let serverState = 1;
                    // console.log('ss'+ss);
                    let cod = result(arr, 33, 34);
                    let ph = parseInt(arr[35], 16)
                    // mysql.query(`SELECT * FROM equipment WHERE equipmentName=${equipment}`, (error, results, fields) => {
                    //     if (error) {
                    //         console.log(error)
                    //         return
                    //     }
                    //     if (results.length === 0) {
                    //         return
                    //     } else {
                    //         console.log(results)
                    //         let oEquipment = results[0];
                    //         mysql.query(`SELECT * FROM equipment_part WHERE equipmentId=${oEquipment.id}`, (err, results1, fields1) => {
                    //             if (err) {
                    //                 console.log(err)
                    //                 return
                    //             }
                    //             if (results1.length === 0) {
                    //                 console.log("进入添加模式")
                    //                 let params = { equipmentId: oEquipment.id, drainageOverflowHeight: 0, InterceptingLimitflowHeight: 0, sunnyToRain: 0, vigilance: 0, rainGauge: 0, bottomHoleHeight, truncatedPipeHeight, groundHeight, sewerageSluice, sluiceHeight, stopWaterLevel1, startWaterLevel1, stopWaterLevel2, startWaterLevel2, sewerageSluiceHeight: 0, stopWaterLevel3, startWaterLevel3, ss, cod, ph, serverState: 1, clientState: 0 };
                    //                 mysql.query('INSERT INTO  equipment_part  SET ?', params, (error2, results2, fields2) => {
                    //                     if (error2) {
                    //                         console.log(error2);
                    //                         return
                    //                     }
                    //                     console.log(results2)
                    //                     let resultArr = ['0x07', '0x' + arr[1], '0x' + arr[2], '0xa5', '0x01', '0x01'];
                    //                     let num = 0
                    //                     for (let i = 0; i < resultArr.length; i++) {
                    //                         num += parseInt(resultArr[i], 16)
                    //                     }
                    //                     resultArr.push('0x' + num.toString(16))
                    //                     console.log(Buffer.from(resultArr));
                    //                     sock.write(Buffer.from(resultArr));
                    //                 });
                    //             } else if (results1.length === 1) {
                    //                 let equipmentPart = results1[0];
                    //                 mysql.query('UPDATE equipment_part SET bottomHoleHeight = ?, truncatedPipeHeight = ?, groundHeight = ? , sewerageSluice = ? , sluiceHeight = ?, stopWaterLevel1 = ?, startWaterLevel1 = ?, stopWaterLevel2 = ?, startWaterLevel2 = ?, stopWaterLevel3 = ?, startWaterLevel3=?, ss=?, cod=?, ph = ?,serverState=? WHERE id = ?',
                    //                     [bottomHoleHeight, truncatedPipeHeight, groundHeight, sewerageSluice, sluiceHeight, stopWaterLevel1, startWaterLevel1, stopWaterLevel2, startWaterLevel2, stopWaterLevel3, startWaterLevel3, ss, cod, ph, serverState, equipmentPart.id], (error2, results2, fields2) => {
                    //                         if (error2) {
                    //                             console.log(error2);
                    //                             return
                    //                         }
                    //                         let resultArr = ['0x07', '0x' + arr[1], '0x' + arr[2], '0xa5', '0x01', '0x01'];
                    //                         let num = 0
                    //                         for (let i = 0; i < resultArr.length; i++) {
                    //                             num += parseInt(resultArr[i], 16)
                    //                         }
                    //                         resultArr.push('0x' + num.toString(16))
                    //                         console.log(Buffer.from(resultArr));
                    //                         sock.write(Buffer.from(resultArr));
                    //                     });
                    //             } else {
                    //                 let equipmentPart = results1[0]
                    //             }
                    //         });
                    //     }
                    //     redis.set(equipment, sock);
                    //     console.log(redis.get(equipment));
                    // })
                } catch (err) {
                    return;
                }
                break;
            case 'a8':
                let equipment = result(arr1, 1, 2);
                const dataBuf = Buffer.from([arr1[4]]);
                let dataLength = parseInt(dataBuf.toString('hex'), 16)
                if (dataLength != arrlength - 6) {
                    return
                }
                const year = unitNumber(arr1, 5);
                const month = unitNumber(arr1, 6);
                const date = unitNumber(arr1, 7);
                const hour = unitNumber(arr1, 8);
                const minutes = unitNumber(arr1, 9);
                const seconds = unitNumber(arr1, 10);
                let creatTime = new Date('20' + year + '-' + month + '-' + date + ' ' + hour + ':' + minutes + ':' + seconds)
                console.log('creatTime', creatTime)
                let waterLevelInWell = result(arr1, 11, 12);
                console.log('waterLevelInWell', waterLevelInWell)
                let riveRaterLevel = result(arr1, 13, 14);
                console.log('riveRaterLevel', riveRaterLevel)
                let waterLevelOfSewagePipe = result(arr1, 15, 16);
                console.log('waterLevelOfSewagePipe', waterLevelOfSewagePipe)
                let garbageHeight = result(arr1, 17, 18);
                console.log('garbageHeight', garbageHeight)
                let sluiceOpeningDegree = result(arr1, 19, 20);
                console.log('sluiceOpeningDegree', sluiceOpeningDegree)
                let sluiceSluiceOpeningDegree = result(arr1, 21, 22);
                console.log('sluiceSluiceOpeningDegree', sluiceSluiceOpeningDegree)
                let basketGrille = result(arr1, 23, 24);
                console.log('basketGrille', basketGrille)
                let sewageFlow1 = result(arr1, 25, 26);
                console.log('sewageFlow1', sewageFlow1)
                let sewageFlow2 = result(arr1, 27, 28);
                console.log('sewageFlow2', sewageFlow2)
                let sewageFlow3 = result(arr1, 29, 30);
                console.log('sewageFlow3', sewageFlow3)
                let totalDischargeOfSewage1 = result1(arr1, 31, 32, 33, 34);
                console.log('totalDischargeOfSewage1', totalDischargeOfSewage1)
                let totalDischargeOfSewage2 = result1(arr1, 35, 36, 37, 38);
                console.log('totalDischargeOfSewage2', totalDischargeOfSewage2)
                let totalDischargeOfSewage3 = result1(arr1, 39, 40, 41, 42);
                console.log('totalDischargeOfSewage3', totalDischargeOfSewage3)
                let rainfall = unitNumber(arr1, 43);
                console.log('rainfall', rainfall)
                let ss = result1(arr1, 44, 45, 46, 47);
                console.log('ss', ss)
                let cod = result(arr1, 48, 49);
                console.log('cod', cod)
                let ph = unitNumber(arr1, 50) * 10;
                console.log('ph', ph)
                let waterPump1 = unitNumber(arr1, 51);
                console.log('waterPump1', waterPump1)
                let waterPump2 = unitNumber(arr1, 52);
                console.log('waterPump2', waterPump2)
                let waterPump3 = unitNumber(arr1, 53);
                console.log('waterPump3', waterPump3)
                let floatingBall = unitNumber(arr1, 54);
                console.log('floatingBall', floatingBall)
                let callThePolice = unitNumber(arr1, 55);
                console.log('callThePolice', callThePolice)
                let pressureGauge = unitNumber(arr1, 56);
                console.log('pressureGauge', pressureGauge)
                let hydraulicPumpMotor = unitNumber(arr1, 57);
                console.log('hydraulicPumpMotor', hydraulicPumpMotor)
                let sluiceSwitch = unitNumber(arr1, 58);
                console.log('sluiceSwitch', sluiceSwitch)
                let sluiceSluiceSwitch = unitNumber(arr1, 59);
                console.log('sluiceSluiceSwitch', sluiceSluiceSwitch)
                let liftingGrid = unitNumber(arr1, 60);
                console.log('liftingGrid', liftingGrid)
                let keyboardStatus = unitNumber(arr1, 61);
                console.log('keyboardStatus', keyboardStatus)
                mysql.query(`SELECT * FROM equipment WHERE equipmentName=${equipment}`, (error, results, fields) => {
                    if (results.length === 0) {
                        resultArr = ['0xa9', '0x08', '0x' + arr1[5], '0x' + arr1[6], '0x' + arr1[7], '0x' + arr1[8], '0x' + arr1[9], , '0x' + arr1[10], '0x00'];
                        sock.write(Buffer.from(resultArr));
                        return
                    } else {
                        let oEquipment = results[0]
                        mysql.query(`SELECT * FROM equipment_arameters WHERE equipmentId=${oEquipment.id}`, (error1, results1, fields1) => {
                            if (error) {
                                return
                            }
                            if (results1.length === 0) {
                                let params = { equipmentId: oEquipment.id, creatTime, waterLevelInWell, riveRaterLevel, waterLevelOfSewagePipe, garbageHeight, sluiceOpeningDegree, sluiceSluiceOpeningDegree, basketGrille, sewageFlow1, sewageFlow2, sewageFlow3, totalDischargeOfSewage1, totalDischargeOfSewage2, totalDischargeOfSewage3, rainfall, ss, cod, ph, waterPump1, waterPump2, waterPump3, floatingBall, callThePolice, pressureGauge, hydraulicPumpMotor, sluiceSwitch, sluiceSluiceSwitch, liftingGrid, keyboardStatus, state: 1 }
                                mysql.query('INSERT INTO  equipment_arameters  SET ?', params, (error2, results2, fields2) => {
                                    console.log(results2)
                                    if (error) {
                                        console.log(error)
                                        resultArr = ['0xa9', '0x08', '0x' + arr1[5], '0x' + arr1[6], '0x' + arr1[7], '0x' + arr1[8], '0x' + arr1[9], , '0x' + arr1[10], '0x00'];
                                        sock.write(Buffer.from(resultArr));
                                        return
                                    }
                                    resultArr = ['0xa9', '0x08', '0x' + arr1[5], '0x' + arr1[6], '0x' + arr1[7], '0x' + arr1[8], '0x' + arr1[9], , '0x' + arr1[10], '0x01'];
                                    sock.write(Buffer.from(resultArr));
                                });
                            } else {
                                let equipmentArameters = results1[0];
                                mysql.query('UPDATE equipment_arameters SET creatTime = ?, waterLevelInWell = ?, riveRaterLevel = ? , waterLevelOfSewagePipe = ? , garbageHeight = ?, sluiceOpeningDegree = ?, sluiceSluiceOpeningDegree = ?, basketGrille = ?, sewageFlow1 = ?, sewageFlow2=?, sewageFlow3=?, totalDischargeOfSewage1=?, totalDischargeOfSewage2 = ?,totalDischargeOfSewage3=?,rainfall=?,ss=?,cod=?,ph=?,waterPump1=?,waterPump2=?,waterPump3=?,floatingBall=?,callThePolice=?,pressureGauge=?,hydraulicPumpMotor=?,sluiceSwitch=?,sluiceSluiceSwitch=?,liftingGrid=?,keyboardStatus=? ,state=?  WHERE id = ?',
                                    [creatTime, waterLevelInWell, riveRaterLevel, waterLevelOfSewagePipe, garbageHeight, sluiceOpeningDegree, sluiceSluiceOpeningDegree, basketGrille, sewageFlow1, sewageFlow2, sewageFlow3, totalDischargeOfSewage1, totalDischargeOfSewage2, totalDischargeOfSewage3, rainfall, ss, cod, ph, waterPump1, waterPump2, waterPump3, floatingBall, callThePolice, pressureGauge, hydraulicPumpMotor, sluiceSwitch, sluiceSluiceSwitch, liftingGrid, keyboardStatus, 1, equipmentArameters.id], (error2, results2, fields2) => {
                                        console.log(error2)
                                        if (error2) {
                                            return
                                        }
                                        resultArr = ['0xa9', '0x08', '0x' + arr1[5], '0x' + arr1[6], '0x' + arr1[7], '0x' + arr1[8], '0x' + arr1[9], , '0x' + arr1[10], '0x01'];
                                        sock.write(Buffer.from(resultArr));
                                    })
                            }
                        })

                    }
                })
                break;
            default:
        }
        // timerFn()
    });
    // 为这个socket实例添加一个"close"事件处理函数
    sock.on('close', function () {
        console.log('服务端：客户端连接断开');
    });
}).listen(PORT);
//16->10 两个数
function unitNumber(arr, num) {
    const Buf = Buffer.from([arr[num]]);
    const value = parseInt(Buf.toString('hex'), 16);
    return value;
}
//16->10 两个数
//设备号
function result(arr, num1 = -1, num2 = -1) {
    if (arr.length === 0 || num1 === -1 || num2 === -1) {
        return
    }
    console.log(parseInt(arr[num1], 16) * 256 + parseInt(arr[num2], 16))
    let num = parseInt(arr[num1], 16) * 256 + parseInt(arr[num2], 16);
    return Number(num);
}
//10->16 
//设备时间
function getElementTime(arr, num1 = -1, num2 = -1, num3 = -1, num4 = -1, num5 = -1, num6 = -1) {
    if (arr.length === 0 || num1 === -1 || num2 === -1 || num3 === -1 || num4 === -1 || num5 === -1 || num6 === -1) {
        return
    }
    return (FnParseChange(arr[num1]) + 2000) + '-' + FnParseChange(arr[num2]) + "-" + FnParseChange(arr[num3]) + " " + FnParseChange(arr[num4]) + ":" + FnParseChange(arr[num5]) + ":" + FnParseChange(arr[num6])
}
//10->16
function FnParseChange(data) {
    return parseInt(data, 16)
}
//16->10 三个数
function result1(arr, num1 = -1, num2 = -1, num3 = -1, num4 = -1) {
    if (arr.length === 0 || num1 === -1 || num2 === -1 || num3 === -1, num4 === -1) {
        return
    }
    // console.log((((parseInt(arr[num4],16)*256+parseInt(arr[num3],16))*256+parseInt(arr[num2],16))*256+parseInt(arr[num1],16)))
    let num = (((parseInt(arr[num4], 16) * 256 + parseInt(arr[num3], 16)) * 256 + parseInt(arr[num2], 16)) * 256 + parseInt(arr[num1], 16));
    return Number(num);
}
//10->16两位数

function result2() {
    this.arr = [];
}
result2.prototype.aggregate = function (num) {
    if (num === -1) {
        return
    }
    let arr = [Math.floor(num / 256), num % 256];
    for (let item of arr) {
        this.arr.push(item)
    }
}
function aggregate(num) {
    if (num === -1) {
        return
    }
    let arr = [Math.floor(num / 256), num % 256];
    return arr;
}
//10->16 4位数
function result3(num) {
    let arr = [];
    for (let i = 0; i < 4; i++) {
        arr[i] = num % 256;
        num = Math.floor(num / 256);
    }
    console.log(arr)
    return arr
}
//时间矫正
function FnChangeTime(sock, date, arr1) {
    console.log(date, arr1)
    let year = to16(Number(date.getFullYear().toString().slice(2, 4)));
    let month = to16((date.getMonth() + 1))
    let date1 = to16(date.getDate())
    let hourse = to16(date.getHours())
    let minutes = to16(date.getMinutes())
    let seconds = to16(date.getSeconds())

    const arrData = [year, month, date1, hourse, minutes, seconds];
    const data = [arr1[1], arr1[2], '0x92', to16(arrData.length + 1), arr1[5]];
    data.push(...arrData);
    data.unshift(to16(data.length + 2));
    data.push(to16(FnCheckCode(data)));
    return sock.write(Buffer.from(data));
}
//16->10
function to16(num) {
    return '0x' + num.toString(16)
}
//校验码
function FnCheckCode(resultArr) {
    console.log(resultArr)
    let num = 0
    for (let i = 0; i < resultArr.length; i++) {
        num += FnParseChange(resultArr[i])
    }
    return num
}
function timerFn() {
    let numTo = new result2();
    clearTimeout(timer);
    timer = setTimeout(() => {
        mysql.query(`SELECT * FROM equipment_part WHERE clientState=1`, (error, results, fields) => {
            if (error) {
                console.log(error)
            }
            for (let item of results) {
                let equipmentId = item.equipmentId;
                let keys = ["stopWaterLevel1", 'startWaterLevel1', 'stopWaterLevel2', "startWaterLevel2", 'stopWaterLevel3', 'startWaterLevel3', 'ss', 'cod', 'ph', 'pattern', 'vigilance', 'sunnyToRain', 'rainGauge', "drainageOverflowHeight", "InterceptingLimitflowHeight", "seaLevel"]
                for (key of keys) {
                    console.log(key)
                    if (key === 'ph') {
                        numTo.arr.push(item[key])
                        console.log(item[key], 'ph')
                    } else if (key === 'pattern') {
                        console.log(item[key], 'pattern')
                        numTo.arr.push(item[key])
                    } else if (key !== 'ss') {
                        numTo.aggregate(item[key]);
                    } else if (key === 'ss') {
                        for (let i of result3(item[key])) {
                            numTo.arr.push(i)
                        }
                    }
                }
                mysql.query(`SELECT * FROM equipment WHERE id=${equipmentId}`, (error1, results1, fields1) => {
                    if (error1) {
                        console.log(error1)
                    }
                    let equipment = results1[0];
                    let equipmentName = equipment.equipmentName
                    let arr = [];
                    let equipmentNumArr = aggregate(equipmentName)
                    for (let item of equipmentNumArr) {
                        arr.push(item)
                    }
                    console.log(arr, '中')
                    arr.push('176')
                    arr.push(numTo.arr.length)
                    for (let item of numTo.arr) {
                        arr.push(item)
                    }
                    let sumLeng = arr.length + 2
                    arr.unshift(sumLeng);
                    if (!!socketArr[equipmentName]) {
                        for (let item of arr) {
                            item = '0x' + item;
                        }
                        let num = 0
                        for (let i = 0; i < arr.length; i++) {
                            num += parseInt(arr[i], 16)
                        }
                        arr.push('0x' + num.toString(16))
                        socketArr[equipmentName].write(Buffer.from(arr));
                        mysql.query('UPDATE equipment_part SET clientState = ? WHERE id = ?', [0, item.id], (error2, results2, fields2) => {
                            if (error1) {
                                console.log(error1)
                                return
                            }
                            console.log(results2)
                        })
                    }
                })
            }
        })
        timerFn()
    }, 1000)
}
console.log('Server listening on ' + PORT);
