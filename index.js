const express = require("express");
const app = express();
const http = require("http")
require('./src/db/conn');
require("./src/models/RechargeTypeDetails.model")

require("./src/models/RankerTime.model")
const Stopwatch = require('statman-stopwatch');
const Game_loop = require("./src/models/game_loop")

const sw = new Stopwatch(true);

const GAME_LOOP_ID = '642aab63cd300991bc2499ff'

const cors = require("cors");
const userWinModel = require("./src/models/userWinDummy.model")
const FastParityModel = require("./src/models/FastParity.model");
const session = require("express-session");
const RegisterModel = require("./src/models/Register.model");
require("./src/models/CheckInDummy.model")
const { Server } = require("socket.io")
const path = require("path");
const fastParityResultModel = require("./src/models/fastParityResult.model");
const WalletModel = require("./src/models/Wallet.model");
const RechargeSuccessModel = require("./src/models/RechargeSuccessDummy.model");
const userAccountDetailModel = require("./src/models/userAccountDetail.model");
const CheckInDummyModel = require("./src/models/CheckInDummy.model");
const MineSweeperModel = require("./src/models/MineSweeper.model");
const AgentWalletModel = require("./src/models/AgentWallet.model");
const IncomeDetailsModel = require("./src/models/IncomeDetails.model");
const crypto = require("crypto");
var server = http.createServer(app)
var io = new Server(server, {
    cors: {
        origin: "*"
    },
})


app.use(cors())
require("dotenv").config();
const port = process.env.PORT;
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use("/avtar", express.static(path.join(__dirname, "../images")))
const authRouter = require("./src/routes/Auth.routes");
app.use('/api', authRouter)
const mainRouter = require("./src/routes/Main.routes");
const RankerTimeModel = require("./src/models/RankerTime.model");
const crashresultModel = require("./src/models/crashresult.model");
const CrashModel = require("./src/models/Crash.model");

app.set(
    "socketio", io
)
app.use('/api', mainRouter)
const admin = require('./src/routes/Admin/Adminroute')
app.use('/admin',admin)
    
const year = new Date().getFullYear().toString().slice(-2);
const month = ("0" + (new Date().getMonth() + 1)).toString().slice(-2)
const day = String(new Date().getDate()).padStart(2, '0');
const fullDate = year + month + day
const index = "0"
var timers

function startTimer(duration, display) {
    var timer = duration, minutes, seconds;
    setInterval(function () {
        // minutes = parseInt(timer / 60, 10);
        seconds = parseInt(timer % 30, 10);
        seconds = seconds < 10 ? "0" + seconds : seconds;
        timers = seconds
        if (--timer < 0) {
            timer = duration;
        }
    }, 1000);
}
startTimer(Date.now());


app.get('/test', async (req,res) => {
    res.send('Hello Fiewin')
})


app.get('/get_game_status', async (req, res) => {
    let theLoop = await Game_loop.find({ _id: GAME_LOOP_ID })

    io.emit('crash_history', theLoop.previous_crashes)
    io.emit('get_round_id_list', theLoop.round_id_list)
    if (betting_phase == true) {
        res.json({ phase: 'betting_phase', info: phase_start_time })
        return
    }
    else if (game_phase == true) {
        res.json({ phase: 'game_phase', info: phase_start_time })
        return
    }
})

app.get('/all_Crash', async (req, res) => {
    var all = await crashresultModel.find()
    var a = []
    all.map((data) => {
        a.push({
            round_number: data.round_number,
            Crash: data.Crash
        })
    })
    res.json({ data: a })
})


app.get('/auto_cashout_early', async (req, res) => {
    if (!game_phase) {
        return
    }
    theLoop = await Game_loop.findById(GAME_LOOP_ID)
    let time_elapsed = (Date.now() - phase_start_time) / 1000.0
    current_multiplier = (1.0024 * Math.pow(1.0718, time_elapsed)).toFixed(2)
    if ((req.user.payout_multiplier <= game_crash_value) && theLoop.active_player_id_list.includes(req.user.id)) {
        const currUser = await User.findById(req.user.id)
        currUser.balance += currUser.bet_amount * currUser.payout_multiplier
        await currUser.save()
        await theLoop.updateOne({ $pull: { "active_player_id_list": req.user.id } })
        for (const bettorObject of live_bettors_table) {
            if (bettorObject.the_user_id === req.user.id) {
                bettorObject.cashout_multiplier = currUser.payout_multiplier
                bettorObject.profit = (currUser.bet_amount * current_multiplier) - currUser.bet_amount
                bettorObject.b_bet_live = false
                break
            }
        }
        res.json(currUser)
    }
})


app.post('/send_stop', async (req, res) => {
    var { user, crash, round_number } = req.body
    var a = await CrashModel.find({ round_number })

    await CrashModel.updateMany({ $and: [{ round_number: round_number }, { user: user }] }, { win_amount: Number(a[0].amount) * Number(crash), target: crash })
    const amount_of_user = await WalletModel.find({ userId: user })
    const userAccountData1 = await userAccountDetailModel.insertMany({
        userId: user, comment: "Crash Rocket income",
        tradeType: "1",
        image: `${process.env.MAIN_URL}/avtar/crashIncome.png`,
        points: Number(a[0].amount) * Number(crash), type: "crash",
        date: Date.parse(new Date())
    });
    // await userAccountData1.save();
    var a1 = Number(amount_of_user[0].amount) + (Number(a[0].amount) * Number(crash))

    await WalletModel.updateMany({ userId: user }, { amount: a1 })
    res.json({
        res: true
    })
})



app.get('/retrieve_bet_history', async (req, res) => {
    let theLoop = await Game_loop.find({ _id: GAME_LOOP_ID })
    io.emit('crash_history', theLoop.previous_crashes)
    res.json({ status: true })
})

const cashout = async () => {
    theLoop = await Game_loop.findById(GAME_LOOP_ID)
    playerIdList = theLoop.active_player_id_list
    crash_number = game_crash_value

    theLoop.active_player_id_list = []
    await theLoop.save()
}

// Run Game Loop
let phase_start_time = Date.now()
const pat = setInterval(async () => {
    await loopUpdate()
}, 1000)

let live_bettors_table = []
let betting_phase = false
let game_phase = false
let cashout_phase = true
let game_crash_value = -69
let sent_cashout = true

// Game Loop
const loopUpdate = async () => {
    let time_elapsed = (Date.now() - phase_start_time) / 1000.0
    // io.emit("time_elapsed",time_elapsed)
    if (betting_phase) {
        if (time_elapsed > 6) {
            sent_cashout = false
            betting_phase = false
            game_phase = true
            var user = await crashresultModel.find().sort({ _id: -1 }).limit(1)

            io.emit('start_multiplier_count', user.length ? Number(user[0].round_number) + 2 : 2)

            phase_start_time = Date.now()
        }
    } else if (game_phase) {
        current_multiplier = (1.0024 * Math.pow(1.0718, time_elapsed)).toFixed(2)
        // io.emit("a",current_multiplier)

        if (current_multiplier > game_crash_value) {

            io.emit('stop_multiplier_count', game_crash_value.toFixed(2))
            game_phase = false
            cashout_phase = true
            phase_start_time = Date.now()
        }
    } else if (cashout_phase) {
        if (!sent_cashout) {
            await cashout()
            sent_cashout = true
            right_now = Date.now()
            // const update_loop = await Game_loop.findById(GAME_LOOP_ID)
            // await update_loop.updateOne({ $push: { previous_crashes: game_crash_value } })
            // await update_loop.updateOne({ $unset: { "previous_crashes.0": 1 } })
            // await update_loop.updateOne({ $pull: { "previous_crashes": null } })
            // const the_round_id_list = update_loop.round_id_list
            // await update_loop.updateOne({ $push: { round_id_list: the_round_id_list[the_round_id_list.length - 1] + 1 } })
            // await update_loop.updateOne({ $unset: { "round_id_list.0": 1 } })
            // await update_loop.updateOne({ $pull: { "round_id_list": null } })
            var user = await crashresultModel.find().sort({ _id: -1 }).limit(1)

            var userData = await CrashModel.find({ round_number: user.length ? Number(user[0].round_number) + 1 : 1 })
            var user1 = []
            var user2 = []

            if (userData.length) {
                var s = []
                await Promise.all(userData.map(async (data) => {
                    var l = ""
                    if (data.target != 0 && Number(data.target) <= game_crash_value) {
                        user1.push(data.user)
                        await CrashModel.updateMany({ round_number: data.round_number }, { win_amount: Number(data.amount) * Number(data.target) })
                        const amount_of_user = await WalletModel.find({ userId: data.user })
                        const userAccountData1 = await userAccountDetailModel.insertMany({
                            userId: data.user, comment: "Crash Rocket income",
                            tradeType: "1",
                            image: `${process.env.MAIN_URL}/avtar/crashIncome.png`,
                            points: Number(data.amount) * Number(data.target), type: "crash",
                            date: Date.parse(new Date())
                        });
                        // await userAccountData1.save();
                        var a = Number(amount_of_user[0].amount) + (Number(data.amount) * Number(data.target))

                        await WalletModel.updateMany({ userId: data.user }, { amount: a })
                        l = a
                    }
                    else {
                        user2.push(data.user)
                        await CrashModel.updateMany({ round_number: data.round_number }, { win_amount: "0" })
                        l = ""

                    }
                    s.push({ user: data.user, stop: l.length ? data.target : '-', point: data.point, amount: l.length ? "+" + l : "-" + data.amount, round_number: data.round_number })


                }))


                io.emit("win", s)


            }
            await crashresultModel.insertMany({ round_number: user.length ? Number(user[0].round_number) + 1 : 1, Crash: game_crash_value, winning_id: user1, loss_id: user2 })

            io.emit("last_record", {
                Crash: game_crash_value,
                round_number: user.length ? Number(user[0].round_number) + 1 : 1
            })
        }

        if (time_elapsed > 3) {
            cashout_phase = false
            betting_phase = true
            let randomInt = Math.floor(Math.random() * (9999999999 - 0 + 1) + 0)
            if (randomInt % 33 == 0) {
                game_crash_value = 1
            } else {
                random_int_0_to_1 = Math.random()
                while (random_int_0_to_1 == 0) {
                    random_int_0_to_1 = Math.random
                }
                game_crash_value = 0.01 + (0.99 / random_int_0_to_1)
                // game_crash_value = Math.round(game_crash_value * 100) / 100
                game_crash_value = Math.round(game_crash_value * 100) / 100

            }
            io.emit('update_user')
            let theLoop = await Game_loop.find({ _id: GAME_LOOP_ID })
            io.emit('crash_history', theLoop.previous_crashes)
            io.emit('get_round_id_list', theLoop.round_id_list)
            io.emit('start_betting_phase')
            var user = await crashresultModel.find().sort({ _id: -1 }).limit(1)
            var u = await CrashModel.find({ round_number: user.length ? Number(user[0].round_number) + 1 : 1 })

            if (u.length) {
                var a = []
                await Promise.all(u.map((data) => {
                    a.push({ user: data.user, stop: "-", point: data.amount, amount: '-', round_number: user.length ? Number(user[0].round_number) + 2 : 2 })
                }))

                io.emit("add_member1", a)

            }
            else {

                io.emit("add_member1", [])
            }

            io.emit('testingvariable')
            live_bettors_table = []
            phase_start_time = Date.now()
        }
    }
}

io.on("connection", async (socket) => {

    const rank = await RankerTimeModel.find()

    const currTime = Date.parse(new Date())

    if (currTime >= Number(rank[0].endTime)) {
        await RankerTimeModel.updateMany({ endTime: rank[0].endTime },
            { startTime: rank[0].endTime, endTime: Number(rank[0].endTime) / 1000 + (24 * 3600) })
    }

    socket.removeAllListeners();



    // const req = socket.request;
    socket.on("loginid", async (data) => {
        const user_data = await RegisterModel.updateMany({ _id: data }, { socketId: socket.id })
        // const wallet_amount = await WalletModel.find({ userId: data })
        // socket.emit("wallet_amount", wallet_amount[0])
    })
    // USER WIN DUMMY DATA 
    const userWinData = await userWinModel.find()
    socket.emit("user-win", userWinData)
    socket.broadcast.emit("user-win", userWinData)
    // RECHARGE SUCCESS DUMMY DATA 
    const RechargeData = await RechargeSuccessModel.find()
    socket.emit("Recharge_success_Dummy_data", RechargeData)
    socket.broadcast.emit("Recharge_success_Dummy_data", RechargeData)
    //CHECKIN REWARD DUMMY DATA
    const CheckInData = await CheckInDummyModel.find()
    socket.emit("CheckIn_Dummy_data", CheckInData)
    socket.broadcast.emit("CheckIn_Dummy_data", CheckInData)


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

            }, { amount: Number(agentUser[0].amount) + amount, TodayIncome: Number(agentUser[0].TodayIncome) + Number(amount) });
        }
        else {
            const IncomeAgent = await AgentWalletModel.updateMany({

                userId: id,

            }, { amount: Number(agentUser[0].amount) + amount, TodayIncome: amount });
        }
    }

    socket.on("join_fast_parity", async (data) => {
        const { period, user, select_number, point, Amount } = data
        const amount_of_user = await WalletModel.find({ userId: user })
        if (amount_of_user[0].amount < point) {
            socket.emit("balance_low", "balance low")
        }
        else {
            const userAccountData = new userAccountDetailModel({
                userId: user, comment: "Parity Order Expense",
                tradeType: "0",
                points: point,
                image: `${process.env.MAIN_URL}/avtar/parityExpense.png`,
                type: "parity",
                date: Date.parse(new Date())
            });

            await userAccountData.save();
            // userAccountDetailModel
            await WalletModel.updateMany({ userId: user }, { amount: (amount_of_user[0].amount - point).toFixed(2) })
            var value
            if (select_number == "Green" || select_number == "Violet" || select_number == "Red") {
                value = "color"
            }
            else {
                value = "number"
            }
            const data1 = await RegisterModel.find({ mobile_no: user })

            const finaldata = new FastParityModel({ period, value, user, select_number: select_number[0], point, Amount, avtar: data1[0] && data1[0].avtar })
            const saveData = await finaldata.save();
            const fastParityData = await FastParityModel.find().sort({ _id: -1 })
            socket.emit("fast_parity_data", finaldata)
            socket.broadcast.emit("fast_parity_data", finaldata)
        }

        const Data = await RegisterModel.find({ userId: user })
        if (Data[0].inviterId == "") {
        }
        else {
            const leval1Data = await RegisterModel.find({ userId: Data[0].inviterId })
            if (leval1Data[0].inviterId == "") {
                //leval1 
                const agentUser = await AgentWalletModel.find({ userId: Data[0].inviterId })
                const rate = point * 10 / 100

                const Income = new IncomeDetailsModel({
                    points: ((point * rate) / 100),
                    userId: Data[0].inviterId,
                    tradeType: 50,
                    comment: "Leval 1 Order Commission",
                    participantUserId: user,
                    image: `${process.env.MAIN_URL}/avtar/lv1.png`,
                    participantUserName: Data[0].mobile_no,
                });
                const saveData1 = await Income.save();

                socket.emit("invite-id", { point: (point * rate) / 100, userId: Data[0].inviterId })
                socket.broadcast.emit("invite-id", { point: (point * rate) / 100, userId: Data[0].inviterId })


                check(Data[0].inviterId, Number((point * rate) / 100))
            }
            else {
                const leval2Data = await RegisterModel.find({ userId: leval1Data[0].inviterId })
                if (leval2Data[0].inviterId == "") {
                    //leval1
                    const agentUser = await AgentWalletModel.find({ userId: Data[0].inviterId })
                    const rate = point * 10 / 100


                    const Income = new IncomeDetailsModel({
                        points: Number((point * rate) / 100),
                        userId: Data[0].inviterId,
                        tradeType: 50,
                        comment: "Leval 1 Order Commision",
                        participantUserId: user,
                        image: `${process.env.MAIN_URL}/avtar/lv1.png`,
                        participantUserName: Data[0].mobile_no,
                    });
                    const saveData1 = await Income.save();
                    socket.emit("invite-id", { point: Number((point * rate) / 100), userId: Data[0].inviterId })
                    socket.broadcast.emit("invite-id", { point: Number((point * rate) / 100), userId: Data[0].inviterId })


                    check(Data[0].inviterId, Number((point * rate) / 100))
                    //leval2 
                    const agentUser1 = await AgentWalletModel.find({ userId: leval1Data[0].inviterId })
                    const rate1 = point * 20 / 100


                    const Income1 = new IncomeDetailsModel({
                        points: ((point * rate1) / 100),
                        userId: leval1Data[0].inviterId,
                        tradeType: 50,
                        comment: "Leval 2 Order Commision",
                        participantUserId: user,
                        image: `${process.env.MAIN_URL}/avtar/lv1.png`,
                        participantUserName: Data[0].mobile_no,
                    });
                    await Income1.save();
                    socket.emit("invite-id", { point: (point * rate1) / 100, userId: leval1Data[0].inviterId })
                    socket.broadcast.emit("invite-id", { point: (point * rate1) / 100, userId: leval1Data[0].inviterId })
                    check(leval1Data[0].inviterId, Number((point * rate1) / 100))
                }
                else {
                    const leval3Data = await RegisterModel.find({ userId: leval2Data[0].inviterId })
                    //leval1
                    const agentUser = await AgentWalletModel.find({ userId: Data[0].inviterId })
                    const rate = point * 10 / 100

                    const Income = new IncomeDetailsModel({
                        points: ((point * rate) / 100),
                        userId: Data[0].inviterId,
                        tradeType: 50,
                        comment: "Leval 1 Order Commision",
                        participantUserId: user,
                        image: `${process.env.MAIN_URL}/avtar/lv1.png`,
                        participantUserName: Data[0].mobile_no,
                    });
                    const saveData1 = await Income.save();
                    socket.emit("invite-id", { point: (point * rate) / 100, userId: Data[0].inviterId })
                    socket.broadcast.emit("invite-id", { point: (point * rate) / 100, userId: Data[0].inviterId })


                    check(Data[0].inviterId, Number((point * rate) / 100))

                    //leval2
                    const agentUser1 = await AgentWalletModel.find({ userId: leval1Data[0].inviterId })
                    const rate1 = point * 20 / 100

                    const Income1 = new IncomeDetailsModel({
                        points: ((point * rate1) / 100),
                        userId: leval1Data[0].inviterId,
                        tradeType: 50,
                        comment: "Leval 2 Order Commision",
                        participantUserId: user,
                        image: `${process.env.MAIN_URL}/avtar/lv1.png`,
                        participantUserName: Data[0].mobile_no,
                    });
                    await Income1.save();
                    socket.emit("invite-id", { point: (point * rate1) / 100, userId: leval1Data[0].inviterId })
                    socket.broadcast.emit("invite-id", { point: (point * rate1) / 100, userId: leval1Data[0].inviterId })

                    check(leval1Data[0].inviterId, Number((point * rate1) / 100))
                    //leval3
                    const agentUser2 = await AgentWalletModel.find({ userId: leval2Data[0].inviterId })
                    const rate2 = point * 40 / 100


                    const Income2 = new IncomeDetailsModel({
                        points: ((point * rate2) / 100),
                        userId: leval2Data[0].inviterId,
                        tradeType: 50,
                        comment: "Leval 3 Order Commission",
                        participantUserId: user,
                        image: `${process.env.MAIN_URL}/avtar/lv1.png`,
                        participantUserName: Data[0].mobile_no,
                    });
                    await Income2.save();
                    socket.emit("invite-id", { point: (point * rate2) / 100, userId: leval2Data[0].inviterId })
                    socket.broadcast.emit("invite-id", { point: (point * rate2) / 100, userId: leval2Data[0].inviterId })


                    check(leval2Data[0].inviterId, Number((point * rate2) / 100))
                }
            }
        }

    })


    //FastParity1
    var itimer
    var num
    var date_check

    setInterval(async function () {
        socket.emit("countdown", timers)
     
        // socket.broadcast.emit("countdown", seconds)
        if (timers == '02') {
            // socket.on("check_result", async (data) => {
            const period_number = await fastParityResultModel.find().sort({ _id: -1 }).limit(1)
            const period = period_number.length && period_number[0].period.slice(6)
            const period1 = period_number.length && period_number[0].period.slice(0, 6)
            if (period_number.length) {
                if (period1 == fullDate) {
                    num = Number(period) + 1
                    date_check = period1
                }
                else {
                    num = Number(index) + 1
                    date_check = fullDate
                }
            }
            else {
                num = Number(index) + 1
                date_check = fullDate
            }
            var color_user = []
            var number_user = []

            const result = await FastParityModel.find({ period: date_check + num })
            setTimeout(async () => {
                if (result.length) {
                    result.map((data) => {
                        if (data.value == "color") {
                            color_user.push(data)
                        }
                        else {
                            number_user.push(data)
                        }
                    })
                    //color 
                    const obj = color_user.reduce((val, cur) => {
                        val[cur.select_number] = val[cur.select_number] ? val[cur.select_number] + 1 : 1;
                        return val;
                    }, {});

                    const response = Object.keys(obj).map((key) => ({
                        select_number: key,
                        count: obj[key]
                    }));
                    var color_res = response.length && response.reduce(function (prev, current) {
                        return (prev.count < current.count) ? prev : current
                    })

                    //number
                    const obj1 = number_user.reduce((val, cur) => {
                        val[cur.select_number] = val[cur.select_number] ? val[cur.select_number] + 1 : 1;
                        return val;
                    }, {});

                    const response1 = Object.keys(obj1).map((key) => ({
                        select_number: key,
                        count: obj1[key]
                    }));
                    var number_res = response1.length && response1.reduce(function (prev, current) {
                        return (prev.count < current.count) ? prev : current
                    })

                    const final_color = []
                    response.map((data) => {
                        if (data.count == color_res.count) {
                            final_color.push(data.select_number)
                        }
                    })
                    var res1
                    // const final = await FastParityModel.find({ $or: [{ period: result[0].period }, { $or: [{ select_number: color_res.select_number }, { select_number: number_res.select_number }] }] })
                    const final = await FastParityModel.find({ $or: [{ $and: [{ period: date_check + num, select_number: { $in: final_color } }] }, { $and: [{ period: date_check + num, select_number: number_res.select_number }] }] })
                    // final.map(async (data) => {
                    //     const data1 = await RegisterModel.find({ userId: data.user })
                    //     io.to(data1[0].socketId).emit("alert", "hello")
                    // }) 
                    var total_give = 0
                    final.map((data) => {
                        total_give = total_give + Number(data.Amount)
                    })
                    const winuserId = []
                    final.map((data) => {
                        winuserId.push(data.user)
                    })
                    const alert_data = []
                    const fin = await FastParityModel.find({ period: date_check + num })
                    fin.map((data) => {
                        if (winuserId.includes(data.user)) {
                            alert_data.push({ data, status: "Win", total: total_give, color: final_color, number: number_res.select_number })
                        }
                        else {
                            alert_data.push({ data, status: "Loss", total: total_give, color: final_color, number: number_res.select_number })

                        }
                    })
                    socket.emit("alert", alert_data)

                    // fin.map((data) => {
                    //     finId.push(data.user)
                    // })
                    // const winuserId = []
                    // final.map((data) => {
                    //     winuserId.push(data.user)
                    // })

                    if (final.length) {
                        final.map(async (data) => {
                            const value = await WalletModel.find({ userId: data.user })
                            const userAccountData = new userAccountDetailModel({
                                userId: data.user, comment: "Parity inCome",
                                tradeType: "1",
                                image: `${process.env.MAIN_URL}/avtar/parityIncome.png`,
                                points: Number(data.Amount), type: "parity",
                                date: Date.parse(new Date())

                            });
                            await userAccountData.save();
                            await WalletModel.updateMany({ userId: data.user }, { amount: (Number(value[0].amount) + Number(data.Amount)).toFixed(2) })
                        })
                        const period_number1 = await fastParityResultModel.find({ period: result[0].period })
                        if (!period_number1.length) {
                            const res = new fastParityResultModel({
                                period: result[0].period, winuser: winuserId,
                                win_number: { color: final_color.length ? final_color : "G", number: number_res.select_number ? number_res.select_number : "5" }, totalPrice: total_give, number: final_color.concat(number_res.select_number)
                            })
                            res1 = res
                            await res.save();
                        }

                    }
                    socket.emit("result_fast_parity", res1)
                    socket.broadcast.emit("result_fast_parity", res1)
                    const result_all = await fastParityResultModel.find().sort({ _id: -1 }).limit(25)
                    const result_all1 = await fastParityResultModel.find().sort({ _id: -1 })
                    socket.emit("result_all_fast_parity_continue", result_all1)
                    socket.broadcast.emit("result_all_fast_parity_continue", result_all1)
                    socket.emit("result_all_fast_parity", result_all)
                    socket.broadcast.emit("result_all_fast_parity", result_all)
                    if (date_check == fullDate) {
                        socket.emit("period_number1", date_check + (Number(num) + 1))
                        socket.broadcast.emit("period_number1", date_check + (Number(num) + 1))
                    }
                    else {
                        socket.emit("period_number1", fullDate + (Number(index) + 1))
                        socket.broadcast.emit("period_number1", fullDate + (Number(index) + 1))
                    }
                }
               
                else {
                    const period_number1 = await fastParityResultModel.find({ period: date_check + num })
                    var res
                    if (!period_number1.length) {
                        var arr = [["V"], ["G"],
                        ["R"], ["V", "R"], ["V", "G"]]
                        var aa = []
                        aa = arr[Math.floor(Math.random() * arr.length)]
                        var numberRand = [0,1,2,3,4,5,6,7,8,9]
                        var numRand 
                        numRand = numberRand[Math.floor(Math.random() * numberRand.length)]
                    
                        res = new fastParityResultModel({
                            period: date_check + num, winuser: [],
                            win_number: { color: aa, number: numRand },
                            number: aa.concat(numRand)
                        })
                        await res.save();
                    }
                    socket.emit("result_fast_parity", res)
                    socket.broadcast.emit("result_fast_parity", res)
                    const result_all = await fastParityResultModel.find().sort({ _id: -1 }).limit(25)
                    const result_all1 = await fastParityResultModel.find().sort({ _id: -1 })
                    socket.emit("result_all_fast_parity_continue", result_all1)
                    socket.broadcast.emit("result_all_fast_parity_continue", result_all1)
                    socket.emit("result_all_fast_parity", result_all)
                    socket.broadcast.emit("result_all_fast_parity", result_all)
                    if (date_check == fullDate) {
                        socket.emit("period_number1", date_check + (Number(num) + 1))
                        socket.broadcast.emit("period_number1", date_check + (Number(num) + 1))
                    }
                    else {
                        socket.emit("period_number1", fullDate + (Number(index) + 1))
                        socket.broadcast.emit("period_number1", fullDate + (Number(index) + 1))
                    }
                }
            }, [2000])
            // })
        }
        const period_number = await fastParityResultModel.find().sort({ _id: -1 }).limit(1)
        const period = period_number.length && period_number[0].period.slice(6)
        const period1 = period_number.length && period_number[0].period.slice(0, 6)
        if (period_number.length) {
            socket.emit("period_number1", period1 + (Number(period) + 1))
            socket.broadcast.emit("period_number1", period1 + (Number(period) + 1))
        }
        else {
            socket.emit("period_number1", fullDate + (Number(index) + 1))
            socket.broadcast.emit("period_number1", fullDate + (Number(index) + 1))
        }
        //     const fastParityData = await FastParityModel.find().sort({ _id: -1 })
        // socket.emit("fast_parity_data", fastParityData)
        // socket.broadcast.emit("fast_parity_data", fastParityData)
        const result_all = await fastParityResultModel.find().sort({ _id: -1 }).limit(25)
        const result_all1 = await fastParityResultModel.find().sort({ _id: -1 })

        socket.emit("result_all_fast_parity_continue", result_all1)
        socket.broadcast.emit("result_all_fast_parity_continue", result_all1)
        socket.emit("result_all_fast_parity", result_all)
        socket.broadcast.emit("result_all_fast_parity", result_all)
    }, 1000);



    // MineSweeper 

    let board = [];
    let mineLocation = [];
    const CreateBoard = (row, col, bombs) => {

        for (let x = 0; x < row; x++) {
            let subCol = [];
            for (let y = 0; y < col; y++) {
                subCol.push({
                    value: 0,
                    x: x,
                    y: y,
                    p: String.fromCharCode(x + 65) + Number(y + 1)
                });
            }
            board.push(subCol);
        }
        // Randomize Bomb Placement
        let bombsCount = 0;
        while (bombsCount < bombs) {
            // Implementing random function
            let x = random(0, row - 1);
            let y = random(0, col - 1);
            // placing bomb at random location(x,y) on board[x][y]
            if (board[x][y].value === 0) {
                board[x][y].value = "X";
                mineLocation.push([x, y]);
                bombsCount++;
            }
        }
    }
    function random(min = 0, max) {
        // min and max included
        return Math.floor(Math.random() * (max - min + 1) + min);
    }


    socket.on("start", (data) => {
        var type1 = []
        if (data.type == 2) {
            type1 = [data.amount / 1.5, data.amount / (data.amount + 2.9), data.amount / (data.amount + 3.9), data.amount / (data.amount + 6.9), data.amount / (data.amount + 5.9)]
            CreateBoard(2, 2, 1)
        }
        else if (data.type == 4) {
            type1 = [data.amount / 1.5, data.amount / (data.amount + 2.9), data.amount / (data.amount + 3.9), data.amount / (data.amount + 2.9), data.amount / (data.amount + 4.9),
            data.amount / 9.9, data.amount / (data.amount + 5.9), data.amount / (data.amount + 2.9), data.amount / (data.amount + 3.9), data.amount / (data.amount + 4.9),
            data.amount / 9.9, data.amount / (data.amount + 6.9), data.amount / (data.amount + 5.9), data.amount / (data.amount + 6.9), data.amount / (data.amount + 2.9), data.amount / (data.amount + 3.9), data.amount / (data.amount + 5.9)]
            CreateBoard(4, 4, 1)

        }
        else {
            type1 = [data.amount / 1.5, data.amount / (data.amount + 2.9), data.amount / (data.amount + 3.9), data.amount / (data.amount + 2.9), data.amount / (data.amount + 4.9),
            data.amount / 9.9, data.amount / (data.amount + 5.9), data.amount / (data.amount + 2.9), data.amount / (data.amount + 3.9), data.amount / (data.amount + 4.9),
            data.amount / 9.9, data.amount / (data.amount + 6.9), data.amount / (data.amount + 5.9), data.amount / (data.amount + 2.9), data.amount / (data.amount + 3.9),
            data.amount / 9.9, data.amount / (data.amount + 6.9), data.amount / (data.amount + 5.9), data.amount / (data.amount + 2.9), data.amount / (data.amount + 3.9),
            data.amount / 9.9, data.amount / (data.amount + 6.9), data.amount / (data.amount + 5.9), data.amount / (data.amount + 2.9), data.amount / (data.amount + 3.9),
            data.amount / 9.9, data.amount / (data.amount + 6.9), data.amount / (data.amount + 5.9), data.amount / (data.amount + 2.9), data.amount / (data.amount + 3.9),
            data.amount / 9.9, data.amount / (data.amount + 6.9), data.amount / (data.amount + 5.9), data.amount / (data.amount + 2.9), data.amount / (data.amount + 3.9),
            data.amount / 9.9, data.amount / (data.amount + 6.9), data.amount / (data.amount + 5.9), data.amount / (data.amount + 2.9), data.amount / (data.amount + 3.9),
            data.amount / 9.9, data.amount / (data.amount + 6.9), data.amount / (data.amount + 5.9), data.amount / (data.amount + 2.9), data.amount / (data.amount + 3.9),
            data.amount / 9.9, data.amount / (data.amount + 6.9), data.amount / (data.amount + 5.9), data.amount / (data.amount + 2.9), data.amount / (data.amount + 3.9),
            data.amount / 9.9, data.amount / (data.amount + 6.9), data.amount / (data.amount + 5.9), data.amount / (data.amount + 2.9), data.amount / (data.amount + 3.9),
            data.amount / 9.9, data.amount / (data.amount + 6.9), data.amount / (data.amount + 5.9), data.amount / (data.amount + 2.9), data.amount / (data.amount + 3.9),
            data.amount / 9.9, data.amount / (data.amount + 6.9), data.amount / (data.amount + 5.9), data.amount / (data.amount + 2.9), data.amount / (data.amount + 6.9), data.amount / (data.amount + 3.9), data.amount / (data.amount + 5.9)]
            CreateBoard(8, 8, 1)
        }
        socket.emit("board", board)
        socket.on("nextNumber", (data) => {
            socket.emit("bonus", type1[data])
            socket.emit("next", type1[data + 1])
        })
    })
    socket.on("minesweeper_result", async (data) => {
        const { status, select, id, win_point, endDate, mineNumber, histList, targetMine } = data
        const Minesweeperdata = await MineSweeperModel.findByIdAndUpdate({ _id: id }, { status, select, win_point, endDate, mineNumber, histList, targetMine })

        if (status == "1") {
            const fast = await MineSweeperModel.find({ _id: id })
            socket.emit("minesweeper_data", fast[0])
            socket.broadcast.emit("minesweeper_data", fast[0])
            const value = await WalletModel.find({ userId: data.userId })
            const userAccountData1 = new userAccountDetailModel({
                userId: data.userId, comment: "MineSweeper income",
                tradeType: "1",
                image: `${process.env.MAIN_URL}/avtar/boomIncome.png`,
                points: Number(win_point), type: "minesweeper",
                date: Date.parse(new Date())
            });
            await userAccountData1.save();
            
            await WalletModel.updateMany({ userId: data.userId }, { amount: (Number(value[0].amount) + Number(win_point)).toFixed(2) })
        }
        const fast1 = await MineSweeperModel.find({ _id: id })

        socket.emit("Minesweeper_own_data", fast1)
    })


    socket.on("crash_join", async (data) => {
        const { round_number, user, target, amount } = data
       
        socket.emit("add_member", { user: user, stop: "-", point: Number(amount) - Number(amount) * 3 / 100, amount: '-', round_number })
        socket.broadcast.emit("add_member", { user: user, stop: "-", point: Number(amount) - Number(amount) * 3 / 100, amount: '-', round_number })
        const amount_of_user = await WalletModel.find({ userId: user })
        const userAccountData1 = new userAccountDetailModel({
            userId: user, comment: "Crash Rocket order expense",
            tradeType: "0",
            image: `${process.env.MAIN_URL}/avtar/crashExpense.png`,
            points: Number(amount), type: "crash",
            date: Date.parse(new Date())
        });
        await userAccountData1.save()
        // await userAccountData1.save();
        await WalletModel.updateMany({ userId: user }, { amount: (amount_of_user[0].amount - amount).toFixed(2) })

        var a = new CrashModel({ round_number, user, target, point:amount,amount: Number(amount) - Number(amount) * 3 / 100 })
        await a.save()


        // socket.broadcast.emit("add_member", { user: user, stop: "-", point: amount, amount: '-' })

    })
    socket.on('disconnect', function () {
    });
})
server.listen(port, async () => {
   
    // const data1 = [{ color: "red" }, { color: "green" }, { color: "green" },{ color: "red" }]
    // var data2 = []
    // data1.map((data, index) => {
    //     if (data.color == (data1[index - 1] && data1[index - 1].color)) {
    //         data2[index-1].push(data)
    //     }
    //     else{
    //         data2.push([{...data}])
    //     }
    // })
    // var data1 = [{ winnumber: { color: ["R"], number: "2" } },{ winnumber: { color: ["R"], number: "2" } }, { winnumber: { color: ["R"], number: "2" } },{ winnumber: { color: ["G"], number: "2" } },{ winnumber: { color: [""], number: "2" } }]
    // var data2 = []



    // data1.map((data, index) => {


    //     if (data.winnumber.color[0] == (data1[index - 1] && data1[index - 1].winnumber.color[0])) {
    //         data2[data2.length - 1] && data2[data2.length -1 ].push(data)
    //     }
    //     else {
    //         data2.push([{ ...data }])
    //     }
    // })




})  
