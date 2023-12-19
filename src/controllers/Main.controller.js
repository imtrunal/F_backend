const ObjectId = require("mongodb").ObjectId;
const userWinModel = require("../models/userWinDummy.model")

const FastParityModel = require("../models/FastParity.model");
const RegisterModel = require("../models/Register.model");
const fastParityResultModel = require("../models/fastParityResult.model");
const WalletModel = require("../models/Wallet.model");
const RechargeTypeDetailsModel = require("../models/RechargeTypeDetails.model");
const RechargeDetailsModel = require("../models/RechargeDetails.model");
const upload = require("../../src/middleware/multer");
const BankAccountDetailModel = require("../models/BankAccountDetail.model");
// const WalletModel = require("../models/Wallet.model")
require("dotenv").config();
const bcrypt = require("bcrypt");

const ifsc = require('ifsc');
const withdrawDetailModel = require("../models/withdrawDetail.model");
const TaskrewardDetailsModel = require("../models/TaskrewardDetails.model");
const UserTaskRewardDetailsModel = require("../models/UserTaskRewardDetails.model");
const userAccountDetailModel = require("../models/userAccountDetail.model");
const CheckInModel = require("../models/CheckIn.model");
const CheckInBonusModel = require("../models/CheckInBonus.model");
const AgentWalletModel = require("../models/AgentWallet.model");
const InvitePeopleModel = require("../models/InvitePeople.model");
const IncomeDetailsModel = require("../models/IncomeDetails.model");
const InviteLinkModel = require("../models/InviteLink.model");
const { decrypt } = require("./Crpto");
const MineSweeperModel = require("../models/MineSweeper.model");
const RankerTimeModel = require("../models/RankerTime.model");
const ComplaintModel = require("../models/Complaint.model");
const UserGrowthPlanModel = require("../models/UserGrowthPlan.model");
const CrashModel = require("../models/Crash.model");
const crashresultModel = require("../models/crashresult.model");
const AllGamesModel = require("../models/AdminModel/AllGamesModel")


exports.homePage = async (req, res) => {
    try {

        const data = await AllGamesModel.find()
        res.status(200).json(data)




    } catch (error) {
        res.status(401).json({
            status: false,
            message: "Somthing Went Wrong"
        })
    }
}

// DUMMY DATA API 
exports.userWinSaved = async (req, res) => {
    try {

        const { avtar, userId, win_amount, game_name, currency, mobile_no } = req.body
        const RegisterData = new userWinModel({
            avtar, userId, win_amount, game_name, mobile_no, currency
        });

        const saveData = await RegisterData.save();


        res.status(201).json({
            status: true,
            message: "Add successfully "
        })


    } catch (error) {
        res.status(401).json({
            status: false,
            message: "Somthing Went Wrong"
        })
    }
}

exports.userWinDataSaved = async (req, res) => {
    try {

        const data = await userWinModel.find()

        res.status(201).json({
            status: true,
            data: data
        })


    } catch (error) {
        res.status(401).json({
            status: false,
            message: "Somthing Went Wrong"
        })
    }
}

exports.ProbilitySaved = async (req, res) => {
    try {

        const result_all_data = await fastParityResultModel.find().sort({ _id: -1 }).limit(1)
        const da = Number(result_all_data[0].period.slice(0, 6))
        var search = da,
            rgx = new RegExp("^" + search);
            console.log(rgx);
            
        const result_red_data = await fastParityResultModel.find({ number: "R", period: rgx }).count()
        const result_green_data = await fastParityResultModel.find({ number: "G", period: rgx }).count()
        const result_violet_data = await fastParityResultModel.find({ number: "V", period: rgx }).count()
        const result_1_data = await fastParityResultModel.find({ number: 1, period: rgx }).count()
        const result_2_data = await fastParityResultModel.find({ number: 2, period: rgx }).count()
        const result_3_data = await fastParityResultModel.find({ number: 3, period: rgx }).count()
        const result_4_data = await fastParityResultModel.find({ number: 4, period: rgx }).count()
        const result_5_data = await fastParityResultModel.find({ number: 5, period: rgx }).count()
        const result_6_data = await fastParityResultModel.find({ number: 6, period: rgx }).count()
        const result_7_data = await fastParityResultModel.find({ number: 7, period: rgx }).count()
        const result_8_data = await fastParityResultModel.find({ number: 8, period: rgx }).count()
        const result_9_data = await fastParityResultModel.find({ number: 9, period: rgx }).count()
        const result_0_data = await fastParityResultModel.find({ number: 0, period: rgx }).count()
        res.status(201).json({
            status: true,
            data: {
                times: Number(result_all_data[0].period.slice(6)) + 1,
                Red: result_red_data,
                Green: result_green_data,
                Violet: result_violet_data,
                1: result_1_data,
                2: result_2_data,
                3: result_3_data,
                4: result_4_data,
                5: result_5_data,
                6: result_6_data,
                7: result_7_data,
                8: result_8_data,
                9: result_9_data,
                0: result_0_data
            }
        })


    } catch (error) {
        res.status(401).json({
            status: false,
            message: "Somthing Went Wrong"
        })
    }
}


exports.MoreFastParitySaved = async (req, res) => {
    try {

        const data = await fastParityResultModel.find()
        const data1 = data.map((data) => {
            return { period: data.period, winNumber: data.win_number, date: data.date, price: data.totalPrice, currency: data.currency }
        })
        res.status(201).json({
            status: true,
            data: data1
        })


    } catch (error) {
        res.status(401).json({
            status: false,
            message: "Somthing Went Wrong"
        })
    }
}
exports.WalletAmountSaved = async (req, res) => {
    try {
        const id = req.params.id
        const wallet_amount = await WalletModel.find({ userId: id })

        res.status(201).json({
            status: true,
            data: wallet_amount
        })
    } catch (error) {
        res.status(401).json({
            status: false,
            message: "Somthing Went Wrong"
        })
    }
}

exports.userOrderSaved = async (req, res) => {
    try {
        const id = req.params.id
        // const value = req.params.value
        var data1



        const user = await FastParityModel.find({ user: id })

        const result = await fastParityResultModel.find()

        var winnum = new Map(result.map(({ win_number, period }) => ([period, win_number])));
        var winuser = new Map(result.map(({ winuser, period }) => ([period, winuser])));
        var currency = new Map(result.map(({ currency, period }) => ([period, currency])));

        var arrayData = user.map(obj => ({ obj, currency: currency.get(obj.period), winnumber: winnum.get(obj.period) ? winnum.get(obj.period) : {}, status: winnum.get(obj.period) ? winuser.get(obj.period) && winuser.get(obj.period).includes(id) ? "profit" : "loss" : "" }));
        data1 = arrayData.map((data) => {
            return { period: data.obj.period, date: data.obj.date, currency: data.currency, select: data.obj.select_number, point: data.obj.point, win_number: data.winnumber, status: data.status, amount: !data.status == "" ? data.status == "profit" ? data.obj.Amount : (data.obj.point - ((data.obj.point) * 0.20 / 10)).toFixed(2) : "" }
        })

        res.status(201).json({
            status: true,
            data: data1
        })
    } catch (error) {
        res.status(401).json({
            status: false,
            message: "Somthing Went Wrong"
        })
    }
}



// RECHARGE DATA API 

exports.RechargeAmountSaved = async (req, res) => {
    try {
        const { recharge_amount } = req.body
        const transactionID = Math.floor(

            Math.random() * (99999999 - 10000000 + 1) + 10000000

        )

        res.status(201).json({
            status: true,
            data: { transactionID: transactionID }
        })
    } catch (error) {
        res.status(401).json({
            status: false,
            message: "Somthing Went Wrong"
        })
    }
}

// RECHARGE TYPE DETAILS

exports.RechargeDetailSaved = async (req, res) => {
    try {

        const data = await RechargeTypeDetailsModel.find()

        res.status(201).json({
            status: true,
            data: data
        })
    } catch (error) {
        res.status(401).json({
            status: false,
            message: "Somthing Went Wrong"
        })
    }
}
// RECHARGE TRANFERED

exports.RechargeAmountTransSaved = async (req, res) => {
    try {
        const { transactionId, status, paymentMethod, amount, userId, Payee_account } = req.body
        const RegisterData = new RechargeDetailsModel({
            transactionId, status, paymentMethod, amount, userId, Payee_account
        });

        const saveData = await RegisterData.save();

        res.status(201).json({
            status: true,
            message: "trancation save successful..."
        })
    } catch (error) {
        res.status(401).json({
            status: false,
            message: "Somthing Went Wrong"
        })
    }
}

// UPLOAD IMAGE DATA
const uploadSingleImage = upload.single("file")
exports.UploadImageSaved = async (req, res) => {
    uploadSingleImage(req, res, async function (err) {

        if (err) {
            return res.status(400).send({ status: false, message: "Failed" })
        }
        const file = req.file.filename
        const { transactionId, imageData } = req.body
        const data = await RechargeDetailsModel.updateMany({ transactionId: transactionId }, {
            transcationScreenShot: process.env.MAIN_URL + "/avtar/" + file
        })
        // const encoded = req.file.path.buffer.toString('base64')
        // const data =new Buffer(req.file.path).toString("base64")
        //  const data = fs.readFileSync(req.file.path, 'base64')


        res.json({
            status: true,
            message: "Image upload successfully",
            file: process.env.MAIN_URL + "/avtar/" + file,
        })
    })
}


// UPDATE STATUS OF RECHARGE TRANSACTION

exports.RechargeAmountTransStatusSaved = async (req, res) => {
    try {
        const { transactionId, status } = req.body
        const user = await RechargeDetailsModel.find({ transactionId: transactionId })
        if (user[0].status == "0") {

            const data = await RechargeDetailsModel.updateMany({ transactionId: transactionId }, {
                status: "4"
            })
        }
        else {
            const data = await RechargeDetailsModel.updateMany({ transactionId: transactionId }, {
                status: status
            })
        }
        res.status(201).json({
            status: true,
            message: "Status Update successful..."
        })
    } catch (error) {
        res.status(401).json({
            status: false,
            message: "Somthing Went Wrong"
        })
    }
}


//GET SPECIFIC TRANSACTION DATA

exports.RechargeDataSaved = async (req, res) => {
    try {
        const transactionId = req.params.transactionId
        var data
        if (transactionId) {
            data = await RechargeDetailsModel.find({ transactionId: transactionId })
        }

        res.status(201).json({
            status: true,
            data: data
        })
    } catch (error) {
        res.status(401).json({
            status: false,
            message: "Somthing Went Wrong"
        })
    }
}

//GET SPECIFIC USER  TRANSACTION DATA

exports.RechargeDataAllSaved = async (req, res) => {
    try {
        const userId = req.params.userId
        var data
        if (userId) {
            data = await RechargeDetailsModel.find({ userId: userId }).sort({ createdAt: -1 })
        }

        res.status(201).json({
            status: true,
            data: data
        })
    } catch (error) {
        res.status(401).json({
            status: false,
            message: "Somthing Went Wrong"
        })
    }
}


//ADD USER BANK ACCOUNT DATA
exports.AddAccountSaved = async (req, res) => {
    try {
        const { name, ifsc_code, account_number, mode, userId, upi_address } = req.body
        if (mode == 1) {
            if (name.length) {
                if (ifsc_code.length) {
                    if (account_number.length) {
                        // 12345678901234
                        if (/^\d{9,18}$/.test(account_number)) {
                            if (ifsc.validate(ifsc_code)) {
                                // PUNB0999900
                                const RegisterData = new BankAccountDetailModel({
                                    name, ifsc_code, account_number, mode, userId, upi_address
                                });
                                const saveData = await RegisterData.save();
                                res.status(201).json({
                                    status: true,
                                    message: "Add withdraw method successfully"
                                })
                            }
                            else {
                                res.status(201).json({
                                    status: false,
                                    message: "Please check your input ifsc"
                                })
                            }
                        }
                        else {
                            res.status(201).json({
                                status: false,
                                message: "Please check your account number"
                            })
                        }
                    }
                    else {
                        res.status(201).json({
                            status: false,
                            message: "Please enter the account number"
                        })
                    }
                }
                else {
                    res.status(201).json({
                        status: false,
                        message: "Please enter the ifsc code"
                    })
                }
            }
            else {
                res.status(201).json({
                    status: false,
                    message: "Please enter the Actual name"
                })
            }
        }
    } catch (error) {
        res.status(401).json({
            status: false,
            message: "Somthing Went Wrong"
        })
    }
}


//GET SPECIFIC USER  ACCOUNT DATA

exports.UserAccountDataSaved = async (req, res) => {
    try {
        const userId = req.params.userId
        var data
        if (userId) {
            data = await BankAccountDetailModel.find({ userId: userId }).sort({ date: -1 })
        }

        res.status(201).json({
            status: true,
            data: data
        })
    } catch (error) {
        res.status(401).json({
            status: false,
            message: "Somthing Went Wrong"
        })
    }
}



//DELETE SPECIFIC USER  ACCOUNT DATA

exports.UserAccountDataDeleteSaved = async (req, res) => {
    try {
        const { id } = req.body
        var data
        data = await BankAccountDetailModel.deleteMany({ _id: id })

        res.status(201).json({
            status: true,
            data: "Delete Account Successfully"
        })
    } catch (error) {
        res.status(401).json({
            status: false,
            message: "Somthing Went Wrong"
        })
    }
}



//WITHDRAW  DATA

exports.UserWithdrawSaved = async (req, res) => {
    try {
        const socket = req.app.get("socketio")
        const { userId, point, name, mode, account, ifsc, type } = req.body
        var fee = ""
        var transferredAccount = ""
        if (point < 1500) {
            fee = 30
        }
        else {
            fee = point * 2 / 100
        }
        if (mode == 1) {
            transferredAccount = "12345678901234"
        }
        else {
            transferredAccount = ""
        }

        const RegisterData = new withdrawDetailModel({
            userId, point, name, mode, account, ifsc, fee, transferredAccount, status: "0"
        });

        const saveData = await RegisterData.save();
        // Wallet Minus 

        if (type == 1) {
            const value = await WalletModel.find({ userId: userId })
            await WalletModel.updateMany({ userId: userId }, { amount: (Number(value[0].amount) - Number(point)).toFixed(2) })

            const userAccountData = new userAccountDetailModel({
                userId: userId, comment: "Withdraw",
                tradeType: "0",
                image: `${process.env.MAIN_URL}/avtar/withdraw.png`,
                points: Number(point), type: "withdraw",
                date: Date.parse(new Date())
            });
            await userAccountData.save();
        }
        else {
            const Income = new IncomeDetailsModel({
                points: point,
                userId: userId,
                tradeType: 7,
                comment: "Withdraw",
                participantUserId: "",
                image: `${process.env.MAIN_URL}/avtar/withdraw.png`,
                participantUserName: "",
            });
            const saveData1 = await Income.save();
            socket.emit("invite-id", { point: point, userId: userId })
            socket.broadcast.emit("invite-id", { point: point, userId: userId })


            const agentUser = await AgentWalletModel.find({ userId: userId })


            const IncomeAgent = await AgentWalletModel.updateMany({

                userId: userId,

            }, { amount: Number(agentUser[0].amount) - point });

        }




        res.status(201).json({
            status: true,
            message: "withdraw successfully"
        })


    } catch (error) {
        res.status(401).json({
            status: false,
            message: "Somthing Went Wrong"
        })
    }
}


// GET WITHDRAW  DATA


exports.UserWithdrawDataSaved = async (req, res) => {
    try {
        const { userId } = req.params
        var data
        data = await withdrawDetailModel.find({ userId: userId }).sort({ date: -1 })

        res.status(201).json({
            status: true,
            data: data
        })
    } catch (error) {
        res.status(401).json({
            status: false,
            message: "Somthing Went Wrong"
        })
    }
}

// CANCEL WITHDRAW  DATA


exports.UserWithdrawDataCancelSaved = async (req, res) => {
    try {
        const { id } = req.params
        var data
        data = await withdrawDetailModel.updateMany({ _id: id }, { status: "2" })

        res.status(201).json({
            status: true,
            data: "Cancel Successfully"
        })
    } catch (error) {
        res.status(401).json({
            status: false,
            message: "Somthing Went Wrong"
        })
    }
}
//GET TASK REWARD DATA
exports.TaskRewardSaved = async (req, res) => {
    try {
        const userId = req.params.userId
        const data = await UserTaskRewardDetailsModel.find({ userId: userId })

        res.status(201).json({
            status: true,
            data: data
        })
    } catch (error) {
        res.status(401).json({
            status: false,
            message: "Somthing Went Wrong"
        })
    }
}

//Change STATUS TASK REWARD DATA
exports.TaskRewardStatusSaved = async (req, res) => {
    try {
        const { id, status, order, userId } = req.body
        if (status == "0") {
            const data = await UserTaskRewardDetailsModel.updateMany({ _id: id }, { status: "1" })
            res.status(201).json({
                status: true,
                data: "Successfully",
                id: id
            })
        }
        else if (status == "1" && order == "1") {
            const data = await RechargeDetailsModel.find({ userId: userId, status: "1" })
            if (data.length) {
                const data1 = await UserTaskRewardDetailsModel.updateMany({ _id: id }, { status: "2", range: "100" })
                const userAccountData = new userAccountDetailModel({
                    userId: userId, comment: "Recharge",
                    tradeType: "1",
                    points: "5",
                    image: `${process.env.MAIN_URL}/avtar/rechargeOrder.png`,
                    type: "taskreward",
                    date: Date.parse(new Date())

                });

                await userAccountData.save();
                const amount_of_user = await WalletModel.find({ userId: userId })
                // userAccountDetailModel
                await WalletModel.updateMany({ userId: userId }, { amount: (Number(amount_of_user[0].amount) + 5).toFixed(2) })
                res.status(201).json({
                    status: 201,
                    data: "Successfully"
                })
            }
            else {
                res.status(201).json({
                    status: 200,
                    order: "1",
                    data: "Successfully"
                })
            }
        }
        else if (status == "1" && order == "2") {
            const data = await UserTaskRewardDetailsModel.updateMany({ _id: id }, { status: "2", range: "100" })

            const userAccountData = new userAccountDetailModel({
                userId: userId, comment: "Recharge",
                tradeType: "1",
                points: "2",
                image: `${process.env.MAIN_URL}/avtar/learnReward.png`,
                type: "taskreward",
                date: Date.parse(new Date())

            });
            await userAccountData.save();
            const amount_of_user = await WalletModel.find({ userId: userId })
            // userAccountDetailModel
            await WalletModel.updateMany({ userId: userId }, { amount: (Number(amount_of_user[0].amount) + 2).toFixed(2) })
            res.status(201).json({
                status: 201,
                order: "2",
                data: "Successfully"
            })

        }
        else if (status == "1" && order == "3") {
            const data = await FastParityModel.find({ user: userId }).count()
            if (data >= 100) {
                const data1 = await UserTaskRewardDetailsModel.updateMany({ _id: id }, { status: "2", range: "100" })

                const userAccountData = new userAccountDetailModel({
                    userId: userId, comment: "100 order task reward",
                    tradeType: "1",
                    points: "20",
                    image: `${process.env.MAIN_URL}/avtar/task100orders.png`,
                    type: "taskreward",
                    date: Date.parse(new Date())

                });

                await userAccountData.save();
                const amount_of_user = await WalletModel.find({ userId: userId })
                // userAccountDetailModel
                await WalletModel.updateMany({ userId: userId }, { amount: (Number(amount_of_user[0].amount) + 20).toFixed(2) })
                res.status(201).json({
                    status: true,
                    data: "Successfully",
                    id: id
                })

            }
            else {
                const data1 = await UserTaskRewardDetailsModel.updateMany({ _id: id }, { status: "1", range: data })
                res.status(201).json({
                    status: 201,
                    order: "3",
                    data: "Successfully"
                })
            }
        }

        else if (status == "1" && order == "4") {
            const data = await FastParityModel.find({ user: userId }).count()
            if (data >= 1000) {
                const data1 = await UserTaskRewardDetailsModel.updateMany({ _id: id }, { status: "2", range: "100" })

                const userAccountData = new userAccountDetailModel({
                    userId: userId, comment: "1000 order task reward",
                    tradeType: "1",
                    points: "100",
                    image: `${process.env.MAIN_URL}/avtar/task1000orders.png`,
                    type: "taskreward",
                    date: Date.parse(new Date())

                });

                await userAccountData.save();
                const amount_of_user = await WalletModel.find({ userId: userId })
                // userAccountDetailModel
                await WalletModel.updateMany({ userId: userId }, { amount: (Number(amount_of_user[0].amount) + 100).toFixed(2) })
                res.status(201).json({
                    status: true,
                    data: "Successfully",
                    id: id
                })

            }
            else {
                const data1 = await UserTaskRewardDetailsModel.updateMany({ _id: id }, { status: "1", range: data * 100 / 1000 })
                res.status(201).json({
                    status: 201,
                    order: "4",
                    data: "Successfully"
                })
            }

        }
        else if (status == "1" && order == "5") {
            const data = await FastParityModel.find({ user: userId }).count()
            if (data >= 10000) {
                const data1 = await UserTaskRewardDetailsModel.updateMany({ _id: id }, { status: "2", range: "100" })

                const userAccountData = new userAccountDetailModel({
                    userId: userId, comment: "10000 order task reward",
                    tradeType: "1",
                    points: "1000",
                    image: `${process.env.MAIN_URL}/avtar/task10000orders.png`,
                    type: "taskreward",
                    date: Date.parse(new Date())

                });

                await userAccountData.save();
                const amount_of_user = await WalletModel.find({ userId: userId })
                // userAccountDetailModel
                await WalletModel.updateMany({ userId: userId }, { amount: (Number(amount_of_user[0].amount) + 1000).toFixed(2) })
                res.status(201).json({
                    status: true,
                    data: "Successfully",
                    id: id
                })

            }
            else {
                const data1 = await UserTaskRewardDetailsModel.updateMany({ _id: id }, { status: "1", range: data * 100 / 10000 })
                res.status(201).json({
                    status: 201,
                    order: "5",
                    data: "Successfully"
                })
            }

        }
        else if (status == "1" && order == "6") {
            const data = await InvitePeopleModel.find({ userId: userId })
            if (data.length) {
                const data1 = await UserTaskRewardDetailsModel.updateMany({ _id: id }, { status: "2", range: "100" })

                const userAccountData = new userAccountDetailModel({
                    userId: userId, comment: "First invitation",
                    tradeType: "1",
                    points: "5",
                    image: `${process.env.MAIN_URL}/avtar/inviteTaskReward.png`,
                    type: "taskreward",
                    date: Date.parse(new Date())

                });
                await userAccountData.save();
                const amount_of_user = await WalletModel.find({ userId: userId })
                // userAccountDetailModel
                await WalletModel.updateMany({ userId: userId }, { amount: (Number(amount_of_user[0].amount) + 5).toFixed(2) })
                res.status(201).json({
                    status: true,
                    data: "Successfully",
                    id: id
                })

            }
            else {
                const data1 = await UserTaskRewardDetailsModel.updateMany({ _id: id }, { status: "1", range: "0" })
                res.status(201).json({
                    status: 201,
                    order: "6",
                    data: "Successfully"
                })
            }
        }
    } catch (error) {
        res.json({
            status: false,
            message: "Somthing Went Wrong"
        })
    }
}


//GET CHECK IN REWARD DATA
exports.CheckInRewardSaved = async (req, res) => {
    try {
        const userId = req.params.id
        var status
        const year = new Date().getFullYear().toString().slice(-2);
        const month = ("0" + (new Date().getMonth() + 1)).toString().slice(-2)
        const day1 = new Date(new Date().setDate(new Date().getDate() - 1)).getDate()
        const fullDate = year + month + day1
        const data = await CheckInModel.find({ userId: userId }).sort({ index: 1 })
        var val = data.filter((data) => {
            return data.checkInDate == fullDate
        })
        if (val.length && val[0].todayCheckIn == "false") {
            data.map(async (data) => {
                await CheckInModel.updateMany({ userId: userId }, {
                    todayCheckIn: false
                })
            })
        }
        const checkData = await CheckInModel.find({ userId: userId }).sort({ index: 1 }).skip(6)
        const bonus = await CheckInBonusModel.find({ userId: userId })

        if (checkData[0].todayCheckIn == "true" && !bonus.length) {
            status = true
        }
        else {
            status = false
        }
        res.status(201).json({
            status: true,
            data: data,
            checkInAll: status
        })
    } catch (error) {
        res.status(401).json({
            status: false,
            message: "Somthing Went Wrong"
        })
    }
}



//POST CHECK IN REWARD DATA
exports.CheckInPostRewardSaved = async (req, res) => {
    try {
        const { userId, checkInDate, coin } = req.body
        var status
        const checkData = await CheckInModel.find({ userId: userId }).sort({ index: 1 }).skip(6)
        const data = await CheckInModel.updateMany({ userId: userId, checkInDate: checkInDate }, {
            todayCheckIn: true
        })
        if (checkData[0].checkInDate == checkInDate) {
            status = true
        }
        else {
            status = false
        }
        const amount_of_user = await WalletModel.find({ userId: userId })
        // userAccountDetailModel
        await WalletModel.updateMany({ userId: userId }, { amount: (Number(amount_of_user[0].amount) + Number(coin)).toFixed(2) })
        const userAccountData = new userAccountDetailModel({
            userId: userId, comment: "Check in reward",
            tradeType: "1",
            points: coin,
            image: `${process.env.MAIN_URL}/avtar/checkInReward.png`,
            type: "checkin",
            date: Date.parse(new Date())

        });

        await userAccountData.save();
        res.status(201).json({
            status: true,
            message: "Coin add Successfully",
            checkInAll: status
        })
    } catch (error) {
        res.status(401).json({
            status: false,
            message: "Somthing Went Wrong"
        })
    }
}


//GET AMOUNT CHECK IN REWARD DATA
exports.CheckInTakeRewardSaved = async (req, res) => {
    try {
        const { userId } = req.body
        const userAccountData = new CheckInBonusModel({
            userId: userId,
            coin: "20"
        });
        await userAccountData.save()
        const amount_of_user = await WalletModel.find({ userId: userId })
        // userAccountDetailModel
        await WalletModel.updateMany({ userId: userId }, { amount: (Number(amount_of_user[0].amount) + 20).toFixed(2) })
        const userAccountData1 = new userAccountDetailModel({
            userId: userId, comment: "Check in reward",
            tradeType: "1",
            points: 20,
            image: `${process.env.MAIN_URL}/avtar/checkInReward.png`,
            type: "checkin",
            date: Date.parse(new Date())

        });

        await userAccountData1.save();
        res.status(201).json({
            status: true,
            message: "Bonus add Successfully",
        })
    } catch (error) {
        res.status(401).json({
            status: false,
            message: "Somthing Went Wrong"
        })
    }
}


const uploadSingleImage1 = upload.single("file")

//MY ACOOUNT MODIFY DETAILS
exports.MyAccountModifyDetails = async (req, res) => {
    try {
        uploadSingleImage1(req, res, async function (err) {
            const { type, userId, file, nickname, password, inviterId } = req.body

            if (type == "avtar") {

                if (err) {
                    return res.status(400).send({ status: false, message: "Failed" })
                }
                const file = req.file.filename
                const data = await RegisterModel.updateMany({ userId: userId }, {
                    avtar: process.env.MAIN_URL + "/avtar/" + file
                })


                res.json({
                    status: true,
                    message: "Image update successfully",

                })
            }

            else if (type == "name") {
                const data = await RegisterModel.updateMany({ userId: userId }, {
                    nickName: nickname
                })
                res.json({
                    status: true,
                    message: "Name update successfully",

                })
            }
            else if (type == "password") {

                const psd = await bcrypt.hash(password, 12);
                const data = await RegisterModel.updateMany({ userId: userId }, {
                    password: psd
                })
                res.json({
                    status: true,
                    message: "Password update successfully",
                })
            }
            else if (type == "inviterId") {
                const data = await RegisterModel.updateMany({ userId: userId }, {
                    inviterId: inviterId
                })
                res.json({
                    status: true,
                    message: "Inviter ID update successfully",
                })
            }
            else {
                res.end("something wrong!!")
            }
        })
    } catch (error) {
        res.status(401).json({
            status: false,
            message: "Somthing Went Wrong"
        })
    }
}


//GET MY ACCOUNT DATA
exports.MyAccountDetails = async (req, res) => {
    try {
        const { userId } = req.params

        const data = await RegisterModel.find({ userId: userId })
        res.status(201).json({
            status: true,
            data: data
        })
    } catch (error) {
        res.status(401).json({
            status: false,
            message: "Somthing Went Wrong"
        })
    }
}

//GET MY ACCOUNT FINANCIAL DATA
exports.MyAccountFinancialDetails = async (req, res) => {
    try {
        const { id } = req.params
        const data = await userAccountDetailModel.find({ userId: id }).sort({ date: -1 })
        res.status(201).json({
            status: true,
            data: data
        })
    } catch (error) {
        res.status(401).json({
            status: false,
            message: "Somthing Went Wrong"
        })
    }
}

//GET INVITE DATA
exports.InviteDetails = async (req, res) => {
    try {
        const { userId } = req.params
        const data = await AgentWalletModel.find({ userId: userId })
        const invite = await InvitePeopleModel.find({ userId: userId }).count()
        const agentUser = await AgentWalletModel.find({ userId: userId })
        const data1 = await IncomeDetailsModel.find({ userId: userId })
        const years = new Date(agentUser[0].updatedAt).getFullYear().toString().slice(-2);
        const months = ("0" + (new Date(agentUser[0].updatedAt).getMonth() + 1)).toString().slice(-2)
        const day = String(new Date(agentUser[0].updatedAt).getDate()).padStart(2, '0');
        const fullDate = years + "-" + months + "-" + day
        const year1 = new Date().getFullYear().toString().slice(-2);
        const month1 = ("0" + (new Date().getMonth() + 1)).toString().slice(-2)
        const days = String(new Date().getDate()).padStart(2, '0');
        const fullDate1 = year1 + "-" + month1 + "-" + days
        var todayI
        var todayIn
        if (fullDate == fullDate1) {
            todayI = data[0].TodayIncome
            todayIn = data[0].TodayInvite
        }
        else {
            todayI = 0.00
            todayIn = 0

        }
        var user = ""
        data1.map((data) => {
            if (data.tradeType != "55") {
                user = Number(user) + Number(data.points)
            }
        })
        const final_data = [{ amount: data[0].amount, TodayIncome: todayI, TodayInvite: todayIn, Invitecount: invite, IncomeCount: user }]
        res.status(201).json({
            status: true,
            data: final_data
        })
    } catch (error) {
        res.status(401).json({
            status: false,
            message: "Somthing Went Wrong"
        })
    }
}

//GET INCOME DETAILS DATA
exports.IncomeDetails = async (req, res) => {
    try {
        const { userId, type } = req.params
        var data
        if (type != 11) {

            data = await IncomeDetailsModel.find({ userId: userId, tradeType: type }).sort({ date: -1 })
        }
        else {
            data = await IncomeDetailsModel.find({ userId: userId, }).sort({ date: -1 })

        }

        // const invite =await InvitePeopleModel.find({userId: userId}).count()

        res.status(201).json({
            status: true,
            data: data
        })
    } catch (error) {
        res.status(401).json({
            status: false,
            message: "Somthing Went Wrong"
        })

    }
}
//GET INVITE LINK DETAILS DATA
exports.InviteLinkDetails = async (req, res) => {
    try {
        const { userId } = req.params
        const data = await InviteLinkModel.find({ userId: userId })
        // const invite =await InvitePeopleModel.find({userId: userId}).count()

        res.status(201).json({
            status: true,
            data: data
        })
    } catch (error) {
        res.status(401).json({
            status: false,
            message: "Somthing Went Wrong"
        })

    }
}

//GET INVITE PEOPLE DETAILS DATA
exports.InvitePeopleDetails = async (req, res) => {
    try {
        const { userId } = req.params
        const data = await InvitePeopleModel.find({ userId: userId })
        const count = await InvitePeopleModel.find({ userId: userId }).count()
        const leval1c = await InvitePeopleModel.find({ userId: userId, leval: 1 }).count()
        const leval2c = await InvitePeopleModel.find({ userId: userId, leval: 2 }).count()
        const leval3c = await InvitePeopleModel.find({ userId: userId, leval: 3 }).count()

        // const invite =await InvitePeopleModel.find({userId: userId}).count()
        const final_data = data.map((data) => {
            return { leval: data.leval, user: data.InviteeUserId, Type: data.Type, totalcount: count, leval1: leval1c, leval2: leval2c, leval3: leval3c, date: data.date }
        })

        res.status(201).json({
            status: true,
            data: final_data
        })
    } catch (error) {
        res.status(401).json({
            status: false,
            message: "Somthing Went Wrong"
        })

    }
}

//GET INVITE  MOBILE DETAILS DATA
exports.InvitePeopleMobileDetails = async (req, res) => {
    try {
        const { userId } = req.params
        const id = decrypt(userId)
        const data = await InvitePeopleModel.find().sort({ date: -1 }).limit(1)
        const invite = await RegisterModel.find({ userId: data[0].InviteeUserId })
        // const invite =await InvitePeopleModel.find({userId: userId}).count()
        res.status(201).json({
            status: true,
            data: invite[0].mobile_no
        })
    } catch (error) {
        res.status(401).json({
            status: false,
            message: "Somthing Went Wrong"
        })
    }
}

//LUCKY RUPEES DATA
exports.LuckyRupeesDetail = async (req, res) => {
    try {
        const { number } = req.body
        const invite = await RegisterModel.find({ mobile_no: number })
        const data = await userAccountDetailModel.find({ userId: invite[0].userId, type: "lucky" })
        if (!data.length) {
            const userAccountData = new userAccountDetailModel({
                userId: invite[0].userId, comment: "Get a Lucky Rupees",
                tradeType: "1",
                points: "10.00",
                image: `${process.env.MAIN_URL}/avtar/happyRupee.png`,
                type: "lucky",
                date: Date.parse(new Date())

            });

            await userAccountData.save();
            res.status(201).json({
                status: true,
                data: "Get a 10 Lucky Ruppess"
            })
        }
        else {
            res.status(201).json({
                status: false,
                data: "Sorry, you have already received this reward"
            })
        }

    } catch (error) {
        res.status(401).json({
            status: false,
            message: "Somthing Went Wrong"
        })
    }
}


//MINESWEEPER DATA
exports.MineSweeperOrder = async (req, res) => {
    try {
        var socket = req.app.get("socketio")

        const { userId, type, avtar, amount } = req.body
        const amount_of_user = await WalletModel.find({ userId: userId })
        if (amount_of_user[0].amount < amount) {
            res.status(201).json({
                status: false,
                data: "No enough Balance"
            })
        }
        else {

            const userAccountData = new MineSweeperModel({
                userId, type, avtar, amount, status: "0",

            });
            await userAccountData.save();
            const value = await WalletModel.find({ userId: userId })
            const userAccountData1 = new userAccountDetailModel({
                userId: userId, comment: "MineSweeper order expense",
                tradeType: "0",
                image: `${process.env.MAIN_URL}/avtar/boomExpense.png`,
                points: Number(amount), type: "minesweeper",
                date: Date.parse(new Date())
            });
            await userAccountData1.save();
            await WalletModel.updateMany({ userId: userId }, { amount: (Number(value[0].amount) - Number(amount)).toFixed(2) })
         
            // res.status(201).json({
            //     status: true,
            //     data: "Order add Successfully",
            //     id: userAccountData._id
            // })
         

            const check = async (id, amount) => {
                const agentUser = await AgentWalletModel.find({ userId: id })
                const years = new Date(agentUser[0].updatedAt).getFullYear().toString().slice(-2);
                const months = ("0" + (new Date(agentUser[0].updatedAt).getMonth() + 1)).toString().slice(-2)
                const day = String(new Date(agentUser[0].updatedAt).getDate()).padStart(2, '0');
                const fullDate = years + "-" + months + "-" + day
                const year1 = new Date().getFullYear().toString().slice(-2);
                const month1 = ("0" + (new Date().getMonth() + 1)).toString().slice(-2)
                const days = String(new Date().getDate()).padStart(2, '0');
                const fullDate1 = year1 + "-" + month1 + "-" + days
                if (fullDate == fullDate1) {

                    const IncomeAgent = await AgentWalletModel.updateMany({

                        userId: id,

                    }, { amount: Number(agentUser[0].amount) + amount, TodayIncome: Number(agentUser[0].TodayIncome) + amount });
                }
                else {
                    const IncomeAgent = await AgentWalletModel.updateMany({

                        userId: id,

                    }, { amount: Number(agentUser[0].amount) + amount, TodayIncome: amount });
                }
            }
            //INVITE COMMISSION
            const Data = await RegisterModel.find({ userId: userId })
            if (Data[0].inviterId == "") {
                res.status(201).json({
                    status: true,
                    data: "Order add Successfully",
                    id: userAccountData._id
                })
            }
            else {
                const leval1Data = await RegisterModel.find({ userId: Data[0].inviterId })
                if (leval1Data[0].inviterId == "") {
                    //leval1 
                    const agentUser = await AgentWalletModel.find({ userId: Data[0].inviterId })
                    const rate = amount * 10 / 100
                    check(Data[0].inviterId, Number((amount * rate) / 100))


                    const Income = new IncomeDetailsModel({
                        points: ((amount * rate) / 100),
                        userId: Data[0].inviterId,
                        tradeType: 50,
                        comment: "Leval 1 Order Commission",
                        participantUserId: userId,
                        image: `${process.env.MAIN_URL}/avtar/lv1.png`,
                        participantUserName: Data[0].mobile_no,
                    });
                    const saveData1 = await Income.save();
                    socket.emit("invite-id", { point: (amount * rate) / 100, userId: Data[0].inviterId })
               //     socket.broadcast.emit("invite-id", { point: (amount * rate) / 100, userId: Data[0].inviterId })

                }
                else {
                    const leval2Data = await RegisterModel.find({ userId: leval1Data[0].inviterId })
                    if (leval2Data[0].inviterId == "") {
                        //leval1
                        const agentUser = await AgentWalletModel.find({ userId: Data[0].inviterId })
                        const rate = amount * 10 / 100
                        check(Data[0].inviterId, Number((amount * rate) / 100))


                        const Income = new IncomeDetailsModel({
                            points: Number((amount * rate) / 100),
                            userId: Data[0].inviterId,
                            tradeType: 50,
                            comment: "Leval 1 Order Commision",
                            participantUserId: userId,
                            image: `${process.env.MAIN_URL}/avtar/lv1.png`,
                            participantUserName: Data[0].mobile_no,
                        });
                        const saveData1 = await Income.save();
                        socket.emit("invite-id", { point: Number((amount * rate) / 100), userId: Data[0].inviterId })
                        socket.broadcast.emit("invite-id", { point: Number((amount * rate) / 100), userId: Data[0].inviterId })

                        //leval2 
                        const agentUser1 = await AgentWalletModel.find({ userId: leval1Data[0].inviterId })
                        const rate1 = amount * 20 / 100
                        check(leval1Data[0].inviterId, Number((amount * rate1) / 100))


                        const Income1 = new IncomeDetailsModel({
                            points: ((amount * rate1) / 100),
                            userId: leval1Data[0].inviterId,
                            tradeType: 50,
                            comment: "Leval 2 Order Commision",
                            participantUserId: userId,
                            image: `${process.env.MAIN_URL}/avtar/lv1.png`,
                            participantUserName: Data[0].mobile_no,
                        });
                        await Income1.save();
                        socket.emit("invite-id", { point: Number((amount * rate1) / 100), userId: leval1Data[0].inviterId })
                        socket.broadcast.emit("invite-id", { point: Number((amount * rate1) / 100), userId: leval1Data[0].inviterId })

                    }
                    else {
                        const leval3Data = await RegisterModel.find({ userId: leval2Data[0].inviterId })
                        //leval1
                        const agentUser = await AgentWalletModel.find({ userId: Data[0].inviterId })
                        const rate = amount * 10 / 100
                        check(Data[0].inviterId, Number((amount * rate) / 100))


                        const Income = new IncomeDetailsModel({
                            points: ((amount * rate) / 100),
                            userId: Data[0].inviterId,
                            tradeType: 50,
                            comment: "Leval 1 Order Commision",
                            participantUserId: userId,
                            image: `${process.env.MAIN_URL}/avtar/lv1.png`,
                            participantUserName: Data[0].mobile_no,
                        });
                        const saveData1 = await Income.save();
                        socket.emit("invite-id", { point: Number((amount * rate) / 100), userId: Data[0].inviterId })
                        socket.broadcast.emit("invite-id", { point: Number((amount * rate) / 100), userId: Data[0].inviterId })

                        //leval2

                        const agentUser1 = await AgentWalletModel.find({ userId: leval1Data[0].inviterId })
                        const rate1 = amount * 20 / 100
                        check(leval1Data[0].inviterId, Number((amount * rate1) / 100))


                        const Income1 = new IncomeDetailsModel({
                            points: ((amount * rate1) / 100),
                            userId: leval1Data[0].inviterId,
                            tradeType: 50,
                            comment: "Leval 2 Order Commision",
                            participantUserId: userId,
                            image: `${process.env.MAIN_URL}/avtar/lv1.png`,
                            participantUserName: Data[0].mobile_no,
                        });
                        await Income1.save();
                        socket.emit("invite-id", { point: Number((amount * rate1) / 100), userId: leval1Data[0].inviterId })
                        socket.broadcast.emit("invite-id", { point: Number((amount * rate1) / 100), userId: leval1Data[0].inviterId })

                        //leval3
                        const agentUser2 = await AgentWalletModel.find({ userId: leval2Data[0].inviterId })
                        const rate2 = amount * 40 / 100
                        check(leval2Data[0].inviterId, Number((amount * rate2) / 100))


                        const Income2 = new IncomeDetailsModel({
                            points: ((amount * rate2) / 100),
                            userId: leval2Data[0].inviterId,
                            tradeType: 50,
                            comment: "Leval 3 Order Commission",
                            participantUserId: userId,
                            image: `${process.env.MAIN_URL}/avtar/lv1.png`,
                            participantUserName: Data[0].mobile_no,
                        });
                        await Income2.save();
                        socket.emit("invite-id", { point: Number((amount * rate2) / 100), userId: leval2Data[0].inviterId })
                        socket.broadcast.emit("invite-id", { point: Number((amount * rate2) / 100), userId: leval2Data[0].inviterId })

                    }
                }
                res.status(201).json({
                    status: true,
                    data: "Order add Successfully",
                    id: userAccountData._id
                })
            }


          

        }


    } catch (error) {
        console.log(error,"err");
        res.status(401).json({
            status: false,
            message: "Somthing Went Wrong"
        })
    }
}

//MINESWEEPER USER DATA

exports.MineSweeperUserOrder = async (req, res) => {
    try {
        const id = req.params.userId
        var user
        if (req.body.length) {

            user = await MineSweeperModel.find({ userId: id }).sort({ endDate: -1 }).limit(req.body.length)
        }
        else {
            user = await MineSweeperModel.find({ userId: id }).sort({ endDate: -1 })

        }

        res.status(201).json({
            status: true,
            data: user
        })
    } catch (error) {
        res.status(401).json({
            status: false,
            message: "Somthing Went Wrong"
        })
    }
}


//INCOME USER DATA

exports.IncomeUserDetails = async (req, res) => {
    try {
        const id = req.params.userId
        const socket = req.app.get("socketio")

        const data = await IncomeDetailsModel.find({ userId: id })
        var user = []
        data.map((data) => {
            if (data.tradeType != "55") {
                user.push({ date: data.date, amount: data.points })
            }
        })

        res.status(201).json({
            status: true,
            data: user
        })
    } catch (error) {
        res.status(401).json({
            status: false,
            message: "Somthing Went Wrong"
        })
    }
}


//Recharge ADD

exports.RechargeDetails = async (req, res) => {
    try {
        const socket = req.app.get("socketio")

        const { userId, amount } = req.body
        const value = await WalletModel.find({ userId: userId })
        const userAccountData = new userAccountDetailModel({
            userId: userId, comment: "Points purchased successfully",
            tradeType: "1",
            image: `${process.env.MAIN_URL}/avtar/buyPoints.png`,
            points: Number(amount), type: "recharge",
            date: Date.parse(new Date())

        });
        await userAccountData.save();
        await WalletModel.updateMany({ userId: userId }, { amount: (Number(value[0].amount) + Number(amount)).toFixed(2) })
        if (amount >= 100) {
            await RegisterModel.updateMany({ userId: userId }, { effective_user: true })
            const Data = await RegisterModel.find({ userId: userId })
            if (Data[0].inviterId == "") {
            }
            else {
                const leval1Data = await RegisterModel.find({ userId: Data[0].inviterId })
                if (leval1Data[0].inviterId == "") {

                    const Income = new IncomeDetailsModel({
                        points: 50.00,
                        userId: Data[0].inviterId,
                        tradeType: 54,
                        comment: "Effective User  Reward",
                        participantUserId: userId,
                        image: `${process.env.MAIN_URL}/avtar/lv1.png`,
                        participantUserName: Data[0].mobile_no,
                    });
                    const saveData1 = await Income.save();
                    socket.emit("invite-id", { point: 50.00, userId: Data[0].inviterId })
                    socket.broadcast.emit("invite-id", { point: 50.00, userId: Data[0].inviterId })


                }
                else {
                    const leval2Data = await RegisterModel.find({ userId: leval1Data[0].inviterId })
                    if (leval2Data[0].inviterId == "") {



                        const Income = new IncomeDetailsModel({
                            points: 50.00,
                            userId: Data[0].inviterId,
                            tradeType: 54,
                            comment: "Effective User  Reward",
                            participantUserId: userId,
                            image: `${process.env.MAIN_URL}/avtar/lv1.png`,
                            participantUserName: Data[0].mobile_no,
                        });
                        const saveData1 = await Income.save();
                        socket.emit("invite-id", { point: 50.00, userId: Data[0].inviterId })
                        socket.broadcast.emit("invite-id", { point: 50.00, userId: Data[0].inviterId })

                        const Income1 = new IncomeDetailsModel({
                            points: 50.00,
                            userId: leval1Data[0].inviterId,
                            tradeType: 54,
                            comment: "Effective User  Reward",
                            participantUserId: userId,
                            image: `${process.env.MAIN_URL}/avtar/lv1.png`,
                            participantUserName: Data[0].mobile_no,
                        });
                        await Income1.save();
                        socket.emit("invite-id", { point: 50.00, userId: leval1Data[0].inviterId })
                        socket.broadcast.emit("invite-id", { point: 50.00, userId: leval1Data[0].inviterId })

                    }
                    else {
                        const leval3Data = await RegisterModel.find({ userId: leval2Data[0].inviterId })


                        const Income = new IncomeDetailsModel({
                            points: 50.00,
                            userId: Data[0].inviterId,
                            tradeType: 54,
                            comment: "Effective User  Reward",
                            participantUserId: userId,
                            image: `${process.env.MAIN_URL}/avtar/lv1.png`,
                            participantUserName: Data[0].mobile_no,
                        });
                        const saveData1 = await Income.save();
                        socket.emit("invite-id", { point: 50.00, userId: Data[0].inviterId })




                        const Income1 = new IncomeDetailsModel({
                            points: 50.00,
                            userId: leval1Data[0].inviterId,
                            tradeType: 54,
                            comment: "Effective User  Reward",
                            participantUserId: userId,
                            image: `${process.env.MAIN_URL}/avtar/lv1.png`,
                            participantUserName: Data[0].mobile_no,
                        });
                        await Income1.save();
                        socket.emit("invite-id", { point: 50.00, userId: leval1Data[0].inviterId })
                        socket.broadcast.emit("invite-id", { point: 50.00, userId: leval1Data[0].inviterId })




                        const Income2 = new IncomeDetailsModel({
                            points: 50.00,
                            userId: leval2Data[0].inviterId,
                            tradeType: 54,
                            comment: "Effective User  Reward",
                            participantUserId: userId,
                            image: `${process.env.MAIN_URL}/avtar/lv1.png`,
                            participantUserName: Data[0].mobile_no,
                        });
                        await Income2.save();
                        socket.emit("invite-id", { point: 50.00, userId: leval2Data[0].inviterId })
                        socket.broadcast.emit("invite-id", { point: 50.00, userId: leval2Data[0].inviterId })

                    }
                }
            }
        }

        res.status(201).json({
            status: true,
            data: "Balance Add Successfully"
        })
    } catch (error) {
        res.status(401).json({
            status: false,
            message: "Somthing Went Wrong"
        })
    }
}


//RANKING USER DATA

exports.RankingUserDetails = async (req, res) => {
    try {
        const data1 = await RankerTimeModel.find()
        const time = { serverTime: Date.parse(new Date(Date.now())).toString(), rewardTime: data1[0].endTime }
        const data = await AgentWalletModel.find({ updatedAt: { $lt: new Date(Number(data1[0].startTime)) } }).sort({ TodayIncome: -1 }).limit(20)
        const user = [time, data]

        res.status(201).json({
            status: true,
            data: user
        })
    } catch (error) {
        res.status(401).json({
            status: false,
            message: "Somthing Went Wrong"
        })
    }
}



//Complaint
const uploadSingleImage2 = upload.single("file")

exports.ComplaintDetails = async (req, res) => {
    uploadSingleImage2(req, res, async function (err) {

        if (err) {
            return res.status(400).send({ status: false, message: "Failed" })
        }

        const file = req.file.filename
        const { reason, p_method, payee_account, time, payment_account, transaction_id, u_transaction_id, userId } = req.body
        // const user_data = await RechargeDetailsModel.find({ u_transaction_id: u_transaction_id, status: "1" })
        const data = new ComplaintModel({ reason, p_method, payee_account, time, payment_account, transaction_id, u_transaction_id, transferTime: time, userId, file: process.env.MAIN_URL + "/avtar/" + file })

        await data.save()
        await RechargeDetailsModel.updateMany({ transactionId: transaction_id }, { Compaint: "1" })

        res.status(201).json({
            status: true,
            data: "Complaint add Successfully"
        })


    })
}


//GROWTH DETAIL

exports.GrowthDetails = async (req, res) => {
    try {
        const user = req.params.id
        const user1 = await UserGrowthPlanModel.find({ userId: user, leval: "2", status: "0" })
        const user2 = await RegisterModel.find({ inviterId: user1.length && user1[0].userId })

        if (user1.length) {
            const data = await RechargeDetailsModel.find({ userId: user2.length && user2[0].userId, status: "1" })
            var total_amount = 0
            data.map((data1) => {
                total_amount = Number(total_amount) + Number(data1.amount)
            })

            if (total_amount >= 100) {
                const user_data = await UserGrowthPlanModel.updateMany({ userId: user, leval: "2" }, { status: "1" })

            }
        }

        const user3 = await UserGrowthPlanModel.find({ userId: user, leval: "3", status: "0" })
        if (user3.length) {
            const invite = await InvitePeopleModel.find({ userId: user }).count()
            const invite1 = await InvitePeopleModel.find({ userId: user }).limit(5)
            var value = []
            invite1.map((data) => {
                value.push(data.InviteeUserId)
            })
            var status = []
            const final_invite = await RegisterModel.find({ userId: { $in: value } })
            final_invite.map((data) => {
                if (data.effective_user == "true") {
                    status.push("true")
                }
                else {
                    status.push("false")
                }
            })
            if (invite >= 5 && !status.includes("false")) {
                const user_data = await UserGrowthPlanModel.updateMany({ userId: user, leval: "3" }, { status: "1" })
            }
        }


        const user4 = await UserGrowthPlanModel.find({ userId: user, leval: "4", status: "0" })
        if (user4.length) {
            const invite = await InvitePeopleModel.find({ userId: user }).count()
            const invite1 = await InvitePeopleModel.find({ userId: user }).limit(20)
            var value = []
            invite1.map((data) => {
                value.push(data.InviteeUserId)
            })
            var status = []
            const final_invite = await RegisterModel.find({ userId: { $in: value } })
            final_invite.map((data) => {
                if (data.effective_user == "true") {
                    status.push("true")
                }
                else {
                    status.push("false")
                }
            })
            if (invite >= 20 && !status.includes("false")) {
                const user_data = await UserGrowthPlanModel.updateMany({ userId: user, leval: "4" }, { status: "1" })
            }
        }


        const user5 = await UserGrowthPlanModel.find({ userId: user, leval: "5", status: "0" })
        if (user5.length) {
            const invite = await InvitePeopleModel.find({ userId: user }).count()
            const invite1 = await InvitePeopleModel.find({ userId: user }).limit(50)
            var value = []
            invite1.map((data) => {
                value.push(data.InviteeUserId)
            })
            var status = []
            const final_invite = await RegisterModel.find({ userId: { $in: value } })
            final_invite.map((data) => {
                if (data.effective_user == "true") {
                    status.push("true")
                }
                else {
                    status.push("false")
                }
            })
            if (invite >= 50 && !status.includes("false")) {
                const user_data = await UserGrowthPlanModel.updateMany({ userId: user, leval: "5" }, { status: "1" })
            }
        }




        const user6 = await UserGrowthPlanModel.find({ userId: user, leval: "6", status: "0" })
        if (user6.length) {
            const invite = await InvitePeopleModel.find({ userId: user }).count()
            const invite1 = await InvitePeopleModel.find({ userId: user }).limit(1000)
            var value = []
            invite1.map((data) => {
                value.push(data.InviteeUserId)
            })
            var status = []
            const final_invite = await RegisterModel.find({ userId: { $in: value } })
            final_invite.map((data) => {
                if (data.effective_user == "true") {
                    status.push("true")
                }
                else {
                    status.push("false")
                }
            })
            if (invite >= 1000 && !status.includes("false")) {
                const user_data = await UserGrowthPlanModel.updateMany({ userId: user, leval: "6" }, { status: "1" })
            }
        }


        const user7 = await UserGrowthPlanModel.find({ userId: user, leval: "7", status: "0" })
        if (user7.length) {
            const invite = await InvitePeopleModel.find({ userId: user }).count()
            const invite1 = await InvitePeopleModel.find({ userId: user }).limit(10000)
            var value = []
            invite1.map((data) => {
                value.push(data.InviteeUserId)
            })
            var status = []
            const final_invite = await RegisterModel.find({ userId: { $in: value } })
            final_invite.map((data) => {
                if (data.effective_user == "true") {
                    status.push("true")
                }
                else {
                    status.push("false")
                }
            })
            if (invite >= 10000 && !status.includes("false")) {
                const user_data = await UserGrowthPlanModel.updateMany({ userId: user, leval: "7" }, { status: "1" })
            }
        }
        const user_data = await UserGrowthPlanModel.find({ userId: user })
        res.status(201).json({
            status: true,
            data: user_data
        })
    } catch (error) {
        res.status(401).json({
            status: false,
            message: "Somthing Went Wrong"
        })
    }
}


//GROWTH  STATUS DETAIL

exports.GrowthStatusDetails = async (req, res) => {
    try {
        const { userId, leval, point } = req.body
        const user_data = await UserGrowthPlanModel.updateMany({ userId: userId, leval: leval }, { status: "2" })
        const socket = req.app.get("socketio")

        const growth = await UserGrowthPlanModel.updateMany({
            userId: userId,
            leval: leval == "1" ? "2" : leval == "2" ? "3" : leval == "3" ? "4" : leval = "4" ? "5" : leval = "5" ? "6" : leval = "6" ? "7" : "",
        }, {
            status: "0",

        })
        const Income = new IncomeDetailsModel({
            points: point,
            userId: userId,
            tradeType: 56,
            comment: " Other reward",
            participantUserId: "",
            image: `${process.env.MAIN_URL}/avtar/Other.png`,
            participantUserName: "",
        });
        const saveData1 = await Income.save();
        socket.emit("invite-id", { point: point, userId: userId })
        socket.broadcast.emit("invite-id", { point: point, userId: userId })

        const agentUser = await AgentWalletModel.find({ userId: userId })
        const years = new Date(agentUser[0].updatedAt).getFullYear().toString().slice(-2);
        const months = ("0" + (new Date(agentUser[0].updatedAt).getMonth() + 1)).toString().slice(-2)
        const day = String(new Date(agentUser[0].updatedAt).getDate()).padStart(2, '0');
        const fullDate = years + "-" + months + "-" + day
        const year1 = new Date().getFullYear().toString().slice(-2);
        const month1 = ("0" + (new Date().getMonth() + 1)).toString().slice(-2)
        const days = String(new Date().getDate()).padStart(2, '0');
        const fullDate1 = year1 + "-" + month1 + "-" + days
        if (fullDate == fullDate1) {

            const IncomeAgent = await AgentWalletModel.updateMany({

                userId: userId,

            }, { amount: Number(agentUser[0].amount) + Number(point), TodayIncome: Number(agentUser[0].TodayIncome) + Number(point) });
        }
        else {
            const IncomeAgent = await AgentWalletModel.updateMany({

                userId: userId,

            }, { amount: Number(agentUser[0].amount) + Number(point), TodayIncome: Number(point) });
        }
        res.status(201).json({
            status: true,
            data: "Reward win Successfully"
        })
    } catch (error) {
        res.status(401).json({
            status: false,
            message: "Somthing Went Wrong"
        })
    }
}




//Crash USER DATA

exports.CrashUserOrder = async (req, res) => {
    try {
        const id = req.params.userId
        var user
        var crash


        const query = CrashModel.aggregate([

            {
                $lookup: {
                    from: 'crash_results',
                    localField: 'round_number',
                    foreignField: 'round_number',
                    as: 'crash_result'
                }
            },
            {
                $match: { user: id }
            },
            {
                $project: {

                    'round_number': 1,
                    'createdAt': 1,
                    'amount': 1,
                    'target': 1,
                    'point': 1,
                    'win_amount': 1,

                    'Crash': '$crash_result.Crash',

                }
            },

        ]);
        if (req.body.length) {
            query.limit(parseInt(req.body.length) || 10);


        }
        else {


        }
        var results = await query.exec();

        res.status(201).json({
            status: true,
            data: results
        })
    } catch (error) {
        res.status(401).json({
            status: false,
            message: "Somthing Went Wrong"
        })
    }
}
