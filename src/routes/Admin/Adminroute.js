const express = require('express')
const path = require('path')
const router = express.Router()
const bcrypt = require('bcrypt')
const fastParityresultSchema = require('../../models/fastParityResult.model.js')
const fastParitySchema = require('../../models/FastParity.model.js')
const MinesweeperSchema = require('../../models/MineSweeper.model.js')
const RechargeDetailsSchema = require('../../models/RechargeDetails.model.js')
const InvitePeopleSchema = require('../../models/InvitePeople.model.js')
const IncomeDetailsSchema = require('../../models/IncomeDetails.model.js')
const WalletSchema = require('../../models/Wallet.model.js')
const RechargeTypeSchema = require('../../models/RechargeTypeDetails.model.js')
const multer = require('multer')
const CheckInDataSchema = require('../../models/CheckIn.model.js')
const CheckInBonusDataSchema = require('../../models/CheckInBonus.model.js')
const TaskRewardSchema = require('../../models/TaskrewardDetails.model.js')
const sharp = require('sharp')
const fs = require('fs');
const UserTaskRewardSchema = require('../../models/UserTaskRewardDetails.model.js')
const BankAccountDetailSchema = require('../../models/BankAccountDetail.model.js')
const withdrawSchema = require('../../models/withdrawDetail.model.js')
const CrashResult = require('../../models/crashresult.model.js')
const Crash = require('../../models/Crash.model.js')
const UserGrowthSchema = require('../../models/UserGrowthPlan.model.js')
const WebConfigModel = require('../../models/AdminModel/WebConfigModel.js')
const AllGamesModel = require('../../models/AdminModel/AllGamesModel.js')
const Admin_Auth = require('./Admin_Auth')
const RegisterSchema = require('../../models/Register.model.js')
const RegisterAdmin = require('../../models/AdminModel/RegisterAdminModel')




//img save by multer
const maxSize = 1024 * 1024 * 10
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, "../../../images"))
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
})
const upload = multer({
    storage: storage,
    limits: { fileSize: maxSize },
})


//register api
router.post('/register', async (req, res) => {
    const { username, password, wallet } = req.body
    if (!username || !password) {
        return res.status(400).send("Error : please fill the data")
    }
    try {
        const user = new RegisterAdmin({ username, password, wallet })
        await user.save()
        const token = await user.generateToken()
        console.log('token', token);
        console.log(user);
        res.json({ message: "data save" })
    } catch (e) {
        console.log('error', e);
    }
})

//login api
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body
        const login = await RegisterAdmin.findOne({ username: username })
        if (login) {
            const match = await bcrypt.compare(password, login.password)
            if (match) {
                res.status(200).json(login)
            } else {
                res.status(400).json({ message: 'invalid data' })
            }
        }
        else {
            res.status(400).json({ message: 'invalid data' })

        }
    } catch (e) {
        res.send("login error")
    }
})

//all userData api
router.get('/userdata', Admin_Auth, async (req, res) => {
    const { start, length, search, } = req.query;
    const columns = [
        'sr',
        'userId',
        'mobile_no',
        'inviterId',
        'amount',
        'wallet amount',

    ];
    var a = {}
    if (req.query.search && req.query.search.value) {
        const searchValue = req.query.search.value;
        a = {
            $or: [
                // { ref_id: { $regex: `${searchValue}`, $options: "i" } },
                // { "referral_member.member_username": new RegExp(searchValue, 'i') },
                // { "referral_member.member_fullname": new RegExp(searchValue, 'i') },
                {
                    $expr: {
                        $regexMatch: {
                            input: { $toString: `$userId` },
                            regex: new RegExp(parseInt(searchValue))
                        }
                    }
                },
                {
                    $expr: {
                        $regexMatch: {
                            input: { $toString: `$inviterId` },
                            regex: new RegExp(parseInt(searchValue))
                        }
                    }
                },
                {
                    $expr: {
                        $regexMatch: {
                            input: { $toString: `$amount` },
                            regex: new RegExp(parseInt(searchValue))
                        }
                    }
                },
            ]
        }
    }
    if (start && length) {
        if (start && length) {

            try {
                const query = RegisterSchema.aggregate([
                    {
                        $lookup: {
                            from: 'agent_wallets',
                            localField: 'userId',
                            foreignField: 'userId',
                            as: 'odp'
                        }
                    },
                    {
                        $unwind: '$odp'
                    },
                    {

                        $match: a
                    },
                    {
                        $lookup: {
                            from: 'wallets',
                            localField: 'userId',
                            foreignField: 'userId',
                            as: 'od'
                        }
                    },
                    {
                        $unwind: '$od',
                    },
                ])

                if (req.query.order && req.query.order[0] && req.query.order[0].column) {
                    const sortColumn = columns[req.query.order[0].column];
                    const sortDir = req.query.order[0].dir === 'asc' ? 1 : -1;
                    query.sort({ [sortColumn]: sortDir });
                }

                query.skip(Number(req.query.start));
                query.limit(Number(req.query.length));

                var results = await query.exec();
                var packagesData = []

                results.map((data, index) => {
                    var nestedData = {};
                    nestedData['sr'] = index
                    nestedData['userId'] = data.userId
                    nestedData['mobile_no'] = data.mobile_no;
                    nestedData['inviterId'] = data.inviterId
                    nestedData['amount'] = data.od.amount
                    nestedData['walletamount'] = data.odp.amount


                    packagesData.push(nestedData);
                })

                var totalRecords = results.length
            }
            catch (err) {
                console.log(err);
            }
        }
        res.json({
            draw: req.query.draw ? parseInt(req.query.draw) : 1,
            recordsTotal: totalRecords,
            recordsFiltered: totalRecords,
            data: packagesData
        });
    }

})

//one userdata (referal details) Api
router.get('/invitepeoples', Admin_Auth, async (req, res) => {

    const { start, length, search, dataId } = req.query;
    const columns = [
        'sr',
        'InviteUserId',
        'Type',
        'leval',
        'date',

    ];


    if (start && length) {
        if (start && length) {

            try {
                const query = InvitePeopleSchema.find({ userId: dataId })
                if (req.query.search && req.query.search.value) {
                    const searchValue = req.query.search.value;
                    query.or([
                        {
                            $expr: {
                                $regexMatch: {
                                    input: { $toString: `$InviteeUserId` },
                                    regex: new RegExp(parseInt(searchValue))
                                }
                            }
                        },
                        {
                            $expr: {
                                $regexMatch: {
                                    input: { $toString: `$leval` },
                                    regex: new RegExp(parseInt(searchValue))
                                }
                            }
                        }, {
                            $expr: {
                                $regexMatch: {
                                    input: { $toString: `$Type  ` },
                                    regex: new RegExp(parseInt(searchValue))
                                }
                            }
                        },
                    ]);
                }

                if (req.query.order && req.query.order[0] && req.query.order[0].column) {
                    const sortColumn = columns[req.query.order[0].column];
                    const sortDir = req.query.order[0].dir === 'asc' ? 1 : -1;
                    query.sort({ [sortColumn]: sortDir });
                }

                query.skip(Number(req.query.start));
                query.limit(Number(req.query.length));

                var results = await query.exec();
                var packagesData = []

                results.map((data, index) => {
                    var nestedData = {};
                    // res.json(data.odp.amount)
                    nestedData['sr'] = index
                    nestedData['InviteUserId'] = data.InviteeUserId
                    nestedData['Type'] = data.Type;
                    nestedData['leval'] = data.leval
                    nestedData['date'] = data.date
                    packagesData.push(nestedData);
                })

                var totalRecords = results.length
            }
            catch (err) {
                console.log(err);
            }
        }
        res.json({
            draw: req.query.draw ? parseInt(req.query.draw) : 1,
            recordsTotal: totalRecords,
            recordsFiltered: totalRecords,
            data: packagesData
        });
    }

})

//one user Invite Income Api
router.get('/InviteIncomeDetails', Admin_Auth, async (req, res) => {

    const { start, length, search, dataId } = req.query;
    const columns = [
        'sr',
        'participantUserId',
        'tradeType',
        'points',
        'date',
    ];


    if (start && length) {
        if (start && length) {

            try {
                const query = IncomeDetailsSchema.find({ userId: dataId })
                if (req.query.search && req.query.search.value) {
                    const searchValue = req.query.search.value;
                    query.or([
                        {
                            $expr: {
                                $regexMatch: {
                                    input: { $toString: `$participantUserId` },
                                    regex: new RegExp(parseInt(searchValue))
                                }
                            }
                        },
                        {
                            $expr: {
                                $regexMatch: {
                                    input: { $toString: `$tradeType` },
                                    regex: new RegExp(parseInt(searchValue))
                                }
                            }
                        },
                        {
                            $expr: {
                                $regexMatch: {
                                    input: { $toString: `$date` },
                                    regex: new RegExp(parseInt(searchValue))
                                }
                            }
                        },
                        {
                            $expr: {
                                $regexMatch: {
                                    input: { $toString: `$points` },
                                    regex: new RegExp(parseInt(searchValue))
                                }
                            }
                        },
                    ]);
                }

                if (req.query.order && req.query.order[0] && req.query.order[0].column) {
                    const sortColumn = columns[req.query.order[0].column];
                    const sortDir = req.query.order[0].dir === 'asc' ? 1 : -1;
                    query.sort({ [sortColumn]: sortDir });
                }

                query.skip(Number(req.query.start));
                query.limit(Number(req.query.length));

                var results = await query.exec();
                var packagesData = []
                results.map((data, index) => {
                    var nestedData = {};
                    nestedData['sr'] = index
                    nestedData['participantUserId'] = data.participantUserId
                    nestedData['tradeType'] = data.tradeType;
                    nestedData['points'] = data.points
                    nestedData['date'] = data.date

                    packagesData.push(nestedData);
                })

                var totalRecords = results.length
            }
            catch (err) {
                console.log(err);
            }
        }
        res.json({
            draw: req.query.draw ? parseInt(req.query.draw) : 1,
            recordsTotal: totalRecords,
            recordsFiltered: totalRecords,
            data: packagesData
        });
    }

})

//one user Check In Bonus Api
router.get('/CheckInBonus', Admin_Auth, async (req, res) => {

    const { start, length, search, dataId } = req.query;
    const columns = [
        'sr',
        'checkInDate',
        'index',
        'todayCheckIn',
        'coin',
        'checkInBonus'

    ];
    var a = {}
    if (req.query.search && req.query.search.value) {
        const searchValue = req.query.search.value;
        a = {
            $or: [
                // { "referral_member.member_fullname": new RegExp(searchValue, 'i') },
                {
                    $expr: {
                        $regexMatch: {
                            input: { $toString: `$checkInDate` },
                            regex: new RegExp(parseInt(searchValue))
                        }
                    }
                },
                {
                    $expr: {
                        $regexMatch: {
                            input: { $toString: `$index` },
                            regex: new RegExp(parseInt(searchValue))
                        }
                    }
                },
                {
                    $expr: {
                        $regexMatch: {
                            input: { $toString: `$todayCheckIn` },
                            regex: new RegExp(parseInt(searchValue))
                        }
                    }
                },
                {
                    $expr: {
                        $regexMatch: {
                            input: { $toString: `$coin` },
                            regex: new RegExp(parseInt(searchValue))
                        }
                    }
                },
            ]
        }
    }

    if (start && length) {
        if (start && length) {

            try {
                const query = CheckInDataSchema.aggregate([
                    {

                        $match: {
                            userId: dataId
                        }
                    },
                    {
                        $match: a
                    },

                    {
                        $lookup: {
                            from: 'checkinbonus',
                            localField: 'userId',
                            foreignField: 'userId',
                            as: 'odp'
                        }
                    },


                ])


                if (req.query.order && req.query.order[0] && req.query.order[0].column) {
                    const sortColumn = columns[req.query.order[0].column];
                    const sortDir = req.query.order[0].dir === 'asc' ? 1 : -1;
                    query.sort({ [sortColumn]: sortDir });
                }

                query.skip(Number(req.query.start));
                query.limit(Number(req.query.length));

                var results = await query.exec();
                console.log(results);
                var packagesData = []

                results.map((data, index) => {
                    var nestedData = {};
                    nestedData['sr'] = index
                    nestedData['checkInDate'] = data.checkInDate
                    nestedData['index'] = data.index;
                    nestedData['todayCheckIn'] = data.todayCheckIn
                    nestedData['coin'] = data.coin
                    nestedData['checkInBonus'] = data.odp[0]

                    packagesData.push(nestedData);
                })

                var totalRecords = results.length
            }
            catch (err) {
                console.log(err);
            }
        }
        res.json({
            draw: req.query.draw ? parseInt(req.query.draw) : 1,
            recordsTotal: totalRecords,
            recordsFiltered: totalRecords,
            data: packagesData
        });
    }

})

//one user Reword details Api
router.get('/RewordDetails', Admin_Auth, async (req, res) => {

    const { start, length, search, dataId } = req.query;
    const columns = [
        'sr',
        'task',
        'description',
        'date',
        'points',
        'status',
        'range',
        'order',
        'type',

    ];


    if (start && length) {
        if (start && length) {

            try {
                const query = UserTaskRewardSchema.find({ userId: dataId })

                if (req.query.search && req.query.search.value) {
                    const searchValue = req.query.search.value;

                    query.or([
                        { "task": new RegExp(searchValue, 'i') },
                        { "description": new RegExp(searchValue, 'i') },

                        {
                            $expr: {
                                $regexMatch: {
                                    input: { $toString: `$points` },
                                    regex: new RegExp(parseInt(searchValue))
                                }
                            }
                        },
                        {
                            $expr: {
                                $regexMatch: {
                                    input: { $toString: `$status` },
                                    regex: new RegExp(parseInt(searchValue))
                                }
                            }
                        }, {
                            $expr: {
                                $regexMatch: {
                                    input: { $toString: `$range` },
                                    regex: new RegExp(parseInt(searchValue))
                                }
                            }
                        },
                        {
                            $expr: {
                                $regexMatch: {
                                    input: { $toString: `$order` },
                                    regex: new RegExp(parseInt(searchValue))
                                }
                            }
                        },
                        {
                            $expr: {
                                $regexMatch: {
                                    input: { $toString: `$type` },
                                    regex: new RegExp(parseInt(searchValue))
                                }
                            }
                        },
                    ]);
                }

                if (req.query.order && req.query.order[0] && req.query.order[0].column) {
                    const sortColumn = columns[req.query.order[0].column];
                    const sortDir = req.query.order[0].dir === 'asc' ? 1 : -1;
                    query.sort({ [sortColumn]: sortDir });
                }

                query.skip(Number(req.query.start));
                query.limit(Number(req.query.length));

                var results = await query.exec();
                var packagesData = []

                results.map((data, index) => {
                    var nestedData = {};
                    nestedData['sr'] = index
                    nestedData['task'] = data.task
                    nestedData['description'] = data.description;
                    nestedData['date'] = data.date
                    nestedData['points'] = data.points
                    nestedData['status'] = data.status
                    nestedData['range'] = data.range
                    nestedData['order'] = data.order
                    nestedData['type'] = data.type


                    packagesData.push(nestedData);
                })

                var totalRecords = results.length
            }
            catch (err) {
                console.log(err);
            }
        }
        res.json({
            draw: req.query.draw ? parseInt(req.query.draw) : 1,
            recordsTotal: totalRecords,
            recordsFiltered: totalRecords,
            data: packagesData
        });
    }

})

//user Bank Account Details Api
router.get('/BankAccountDetail', Admin_Auth, async (req, res) => {

    const { start, length, search, dataId } = req.query;
    const columns = [
        'sr',
        'name',
        'ifsc_code',
        'account_number',
        'mode',
        'upi_address',
        'date',

    ];


    if (start && length) {
        if (start && length) {

            try {
                const query = BankAccountDetailSchema.find({ userId: dataId })

                if (req.query.search && req.query.search.value) {
                    const searchValue = req.query.search.value;

                    query.or([
                        { "name": new RegExp(searchValue, 'i') },
                        { "ifsc_code": new RegExp(searchValue, 'i') },

                        {
                            $expr: {
                                $regexMatch: {
                                    input: { $toString: `$account_number` },
                                    regex: new RegExp(parseInt(searchValue))
                                }
                            }
                        },
                        {
                            $expr: {
                                $regexMatch: {
                                    input: { $toString: `$mode` },
                                    regex: new RegExp(parseInt(searchValue))
                                }
                            }
                        }, {
                            $expr: {
                                $regexMatch: {
                                    input: { $toString: `$upi_address` },
                                    regex: new RegExp(parseInt(searchValue))
                                }
                            }
                        }, {
                            $expr: {
                                $regexMatch: {
                                    input: { $toString: `$date` },
                                    regex: new RegExp(parseInt(searchValue))
                                }
                            }
                        },
                    ]);
                }

                if (req.query.order && req.query.order[0] && req.query.order[0].column) {
                    const sortColumn = columns[req.query.order[0].column];
                    const sortDir = req.query.order[0].dir === 'asc' ? 1 : -1;
                    query.sort({ [sortColumn]: sortDir });
                }

                query.skip(Number(req.query.start));
                query.limit(Number(req.query.length));

                var results = await query.exec();
                var packagesData = []

                results.map((data, index) => {
                    var nestedData = {};
                    // res.json(data.odp.amount)
                    nestedData['sr'] = index
                    nestedData['name'] = data.name
                    nestedData['ifsc_code'] = data.ifsc_code;
                    nestedData['account_number'] = data.account_number
                    nestedData['mode'] = data.mode
                    nestedData['upi_address'] = data.upi_address
                    nestedData['date'] = data.date

                    packagesData.push(nestedData);
                })
                var totalRecords = results.length
            }
            catch (err) {
                console.log(err);
            }
        }
        res.json({
            draw: req.query.draw ? parseInt(req.query.draw) : 1,
            recordsTotal: totalRecords,
            recordsFiltered: totalRecords,
            data: packagesData
        });
    }

})

// Agent Cash Growth Plan Api
router.get('/AgentCashGrowthPlan', Admin_Auth, async (req, res) => {

    const { start, length, search, dataId } = req.query;
    const columns = [
        'sr',
        'leval',
        'status',
        'point',
        'date',

    ];


    if (start && length) {
        if (start && length) {

            try {
                const query = UserGrowthSchema.find({ userId: dataId })

                if (req.query.search && req.query.search.value) {
                    const searchValue = req.query.search.value;

                    query.or([
                        {
                            $expr: {
                                $regexMatch: {
                                    input: { $toString: `$status` },
                                    regex: new RegExp(parseInt(searchValue))
                                }
                            }
                        },
                        {
                            $expr: {
                                $regexMatch: {
                                    input: { $toString: `$leval` },
                                    regex: new RegExp(parseInt(searchValue))
                                }
                            }
                        }, {
                            $expr: {
                                $regexMatch: {
                                    input: { $toString: `$point  ` },
                                    regex: new RegExp(parseInt(searchValue))
                                }
                            }
                        }, {
                            $expr: {
                                $regexMatch: {
                                    input: { $toString: `$date` },
                                    regex: new RegExp(parseInt(searchValue))
                                }
                            }
                        },
                    ]);
                }

                if (req.query.order && req.query.order[0] && req.query.order[0].column) {
                    const sortColumn = columns[req.query.order[0].column];
                    const sortDir = req.query.order[0].dir === 'asc' ? 1 : -1;
                    query.sort({ [sortColumn]: sortDir });
                }

                query.skip(Number(req.query.start));
                query.limit(Number(req.query.length));

                var results = await query.exec();
                var packagesData = []

                results.map((data, index) => {
                    var nestedData = {};
                    // res.json(data.odp.amount)
                    nestedData['sr'] = index
                    nestedData['leval'] = data.leval
                    nestedData['status'] = data.status;
                    nestedData['point'] = data.point
                    nestedData['date'] = data.date

                    packagesData.push(nestedData);
                })
                var totalRecords = results.length
            }
            catch (err) {
                console.log(err);
            }
        }
        res.json({
            draw: req.query.draw ? parseInt(req.query.draw) : 1,
            recordsTotal: totalRecords,
            recordsFiltered: totalRecords,
            data: packagesData
        });
    }

})

//Fast Parity game Api
router.get('/FastParity', Admin_Auth, async (req, res) => {

    const { start, length, search, dataId } = req.query;
    const columns = [
        'sr',
        'period',
        'win_number',
        'totalPrice',
        'date',

    ];


    if (start && length) {
        if (start && length) {

            try {
                const query = fastParityresultSchema.find()
                const query1 = await fastParityresultSchema.find().countDocuments()


                if (req.query.search && req.query.search.value) {
                    const searchValue = req.query.search.value;

                    query.or([
                        {
                            $expr: {
                                $regexMatch: {
                                    input: { $toString: `$period` },
                                    regex: new RegExp(parseInt(searchValue))
                                }
                            }
                        },
                        {
                            $expr: {
                                $regexMatch: {
                                    input: { $toString: `$period` },
                                    regex: new RegExp(parseInt(searchValue))
                                }
                            }
                        }, {
                            $expr: {
                                $regexMatch: {
                                    input: { $toString: `$totalPrice` },
                                    regex: new RegExp(parseInt(searchValue))
                                }
                            }
                        }, {
                            $expr: {
                                $regexMatch: {
                                    input: { $toString: `$date` },
                                    regex: new RegExp(parseInt(searchValue))
                                }
                            }
                        },
                    ]);
                }

                if (req.query.order && req.query.order[0] && req.query.order[0].column) {
                    const sortColumn = columns[req.query.order[0].column];
                    const sortDir = req.query.order[0].dir === 'asc' ? 1 : -1;
                    query.sort({ [sortColumn]: sortDir });
                }

                query.skip(Number(req.query.start));
                query.limit(Number(req.query.length));

                var results = await query.exec();
                var packagesData = []

                results.map((data, index) => {
                    var nestedData = {};
                    nestedData['sr'] = index
                    nestedData['period'] = data.period
                    nestedData['win_number'] = data.win_number;
                    nestedData['totalPrice'] = data.totalPrice
                    nestedData['date'] = data.date

                    packagesData.push(nestedData);
                })

                var totalRecords = query1
            }
            catch (err) {
                console.log(err);
            }
        }
        res.json({
            draw: req.query.draw ? parseInt(req.query.draw) : 1,
            recordsTotal: totalRecords,
            recordsFiltered: totalRecords,
            data: packagesData
        });
    }

})

//period data Api
router.get('/periodData', Admin_Auth, async (req, res) => {

    const { start, length, search, dataId } = req.query;

    const columns = [
        'sr',
        'user',
        'select_number',
        'point',
        'status',
        'date',

    ];
    var a = {}
    if (req.query.search && req.query.search.value) {
        const searchValue = req.query.search.value;
        a = {
            $or: [
                {
                    $expr: {
                        $regexMatch: {
                            input: { $toString: `$user` },
                            regex: new RegExp(parseInt(searchValue))
                        }
                    }
                },
                {
                    $expr: {
                        $regexMatch: {
                            input: { $toString: `$select_number` },
                            regex: new RegExp(parseInt(searchValue))
                        }
                    }
                },
                {
                    $expr: {
                        $regexMatch: {
                            input: { $toString: `$point` },
                            regex: new RegExp(parseInt(searchValue))
                        }
                    }
                },
                {
                    $expr: {
                        $regexMatch: {
                            input: { $toString: `$status` },
                            regex: new RegExp(parseInt(searchValue))
                        }
                    }
                },
            ]
        }
    }

    if (start && length) {
        if (start && length) {
            try {
                const query = fastParitySchema.aggregate([
                    {

                        $match: {
                            period: dataId
                        }
                    },
                    {
                        $match: a
                    },

                    {
                        $lookup: {
                            from: 'fastparityresults',
                            localField: 'period',
                            foreignField: 'period',
                            as: 'odp'
                        }
                    },

                ])

                if (req.query.order && req.query.order[0] && req.query.order[0].column) {
                    const sortColumn = columns[req.query.order[0].column];
                    const sortDir = req.query.order[0].dir === 'asc' ? 1 : -1;
                    query.sort({ [sortColumn]: sortDir });
                }

                query.skip(Number(req.query.start));
                query.limit(Number(req.query.length));

                var results = await query.exec();
                var packagesData = []

                results.map((data, index) => {
                    var nestedData = {};
                    nestedData['sr'] = index
                    nestedData['user'] = data.user
                    nestedData['select_number'] = data.select_number;
                    nestedData['point'] = data.point
                    nestedData['status'] = data.odp
                    nestedData['date'] = data.date

                    packagesData.push(nestedData);
                })

                var totalRecords = results.length
            }
            catch (err) {
                console.log(err);
            }
        }
        res.json({
            draw: req.query.draw ? parseInt(req.query.draw) : 1,
            recordsTotal: totalRecords,
            recordsFiltered: totalRecords,
            data: packagesData
        });
    }

})

//Mines-Sweeper Api
router.get('/MinesSweeper', Admin_Auth, async (req, res) => {

    const { start, length, search, } = req.query;
    const columns = [
        'sr',
        'userId',
        'status',
        'type',
        'win_point',
        'amount',
        'startDate',
        'endDate',


    ];


    if (start && length) {
        if (start && length) {

            try {
                const query = MinesweeperSchema.find()
                const query1 = await MinesweeperSchema.find().countDocuments()


                if (req.query.search && req.query.search.value) {
                    const searchValue = req.query.search.value;

                    query.or([
                        {
                            $expr: {
                                $regexMatch: {
                                    input: { $toString: `$period` },
                                    regex: new RegExp(parseInt(searchValue))
                                }
                            }
                        },
                        {
                            $expr: {
                                $regexMatch: {
                                    input: { $toString: `$period` },
                                    regex: new RegExp(parseInt(searchValue))
                                }
                            }
                        }, {
                            $expr: {
                                $regexMatch: {
                                    input: { $toString: `$totalPrice` },
                                    regex: new RegExp(parseInt(searchValue))
                                }
                            }
                        }, {
                            $expr: {
                                $regexMatch: {
                                    input: { $toString: `$date` },
                                    regex: new RegExp(parseInt(searchValue))
                                }
                            }
                        },
                    ]);
                }

                if (req.query.order && req.query.order[0] && req.query.order[0].column) {
                    const sortColumn = columns[req.query.order[0].column];
                    const sortDir = req.query.order[0].dir === 'asc' ? 1 : -1;
                    query.sort({ [sortColumn]: sortDir });
                }

                query.skip(Number(req.query.start));
                query.limit(Number(req.query.length));

                var results = await query.exec();
                var packagesData = []

                results.map((data, index) => {
                    var nestedData = {};
                    nestedData['sr'] = index
                    nestedData['userId'] = data.userId
                    nestedData['status'] = data.status;
                    nestedData['type'] = data.type
                    nestedData['win_point'] = data.win_point
                    nestedData['amount'] = data.amount
                    nestedData['startDate'] = data.startDate
                    nestedData['endDate'] = data.endDate

                    packagesData.push(nestedData);
                })

                var totalRecords = query1
            }
            catch (err) {
                console.log(err);
            }
        }
        res.json({
            draw: req.query.draw ? parseInt(req.query.draw) : 1,
            recordsTotal: totalRecords,
            recordsFiltered: totalRecords,
            data: packagesData
        });
    }

})

//Crash game Api
router.get('/crashResult', Admin_Auth, async (req, res) => {

    const { start, length, search, } = req.query;
    const columns = [
        'sr',
        'round_number',
        'Crash',
        'createdAt',
        'updatedAt',

    ];


    if (start && length) {
        if (start && length) {

            try {
                const query = CrashResult.find()
                const query1 = await CrashResult.find().countDocuments()


                if (req.query.search && req.query.search.value) {
                    const searchValue = req.query.search.value;

                    query.or([
                        {
                            $expr: {
                                $regexMatch: {
                                    input: { $toString: `$round_number` },
                                    regex: new RegExp(parseInt(searchValue))
                                }
                            }
                        },
                        {
                            $expr: {
                                $regexMatch: {
                                    input: { $toString: `$Crash` },
                                    regex: new RegExp(parseInt(searchValue))
                                }
                            }
                        },
                    ]);
                }

                if (req.query.order && req.query.order[0] && req.query.order[0].column) {
                    const sortColumn = columns[req.query.order[0].column];
                    const sortDir = req.query.order[0].dir === 'asc' ? 1 : -1;
                    query.sort({ [sortColumn]: sortDir });
                }

                query.skip(Number(req.query.start));
                query.limit(Number(req.query.length));

                var results = await query.exec();
                var packagesData = []

                results.map((data, index) => {
                    var nestedData = {};
                    nestedData['sr'] = index
                    nestedData['round_number'] = data.round_number
                    nestedData['Crash'] = data.Crash;
                    nestedData['createdAt'] = data.createdAt
                    nestedData['updatedAt'] = data.updatedAt

                    packagesData.push(nestedData);
                })

                var totalRecords = query1
            }
            catch (err) {
                console.log(err);
            }
        }
        res.json({
            draw: req.query.draw ? parseInt(req.query.draw) : 1,
            recordsTotal: totalRecords,
            recordsFiltered: totalRecords,
            data: packagesData
        });
    }

})

//Crash game Round Data Api
router.get('/RoundData', Admin_Auth, async (req, res) => {

    const { start, length, search, dataId } = req.query;
    const columns = [
        'sr',
        'user',
        'target',
        'amount',
        'point',
        'win_amount',
        'createdAt',
        'updatedAt',

    ];


    if (start && length) {
        if (start && length) {

            try {
                const query = Crash.find({ round_number: dataId })
                const query1 = await Crash.find().countDocuments()


                if (req.query.search && req.query.search.value) {
                    const searchValue = req.query.search.value;

                    query.or([
                        {
                            $expr: {
                                $regexMatch: {
                                    input: { $toString: `$user` },
                                    regex: new RegExp(parseInt(searchValue))
                                }
                            }
                        },
                        {
                            $expr: {
                                $regexMatch: {
                                    input: { $toString: `$target` },
                                    regex: new RegExp(parseInt(searchValue))
                                }
                            }
                        },
                        {
                            $expr: {
                                $regexMatch: {
                                    input: { $toString: `$amount` },
                                    regex: new RegExp(parseInt(searchValue))
                                }
                            }
                        },
                        {
                            $expr: {
                                $regexMatch: {
                                    input: { $toString: `$point` },
                                    regex: new RegExp(parseInt(searchValue))
                                }
                            }
                        },
                    ]);
                }

                if (req.query.order && req.query.order[0] && req.query.order[0].column) {
                    const sortColumn = columns[req.query.order[0].column];
                    const sortDir = req.query.order[0].dir === 'asc' ? 1 : -1;
                    query.sort({ [sortColumn]: sortDir });
                }

                query.skip(Number(req.query.start));
                query.limit(Number(req.query.length));

                var results = await query.exec();
                var packagesData = []

                results.map((data, index) => {
                    var nestedData = {};
                    nestedData['sr'] = index
                    nestedData['user'] = data.user
                    nestedData['target'] = data.target;
                    nestedData['amount'] = data.amount;
                    nestedData['point'] = data.point;
                    nestedData['win_amount'] = data.win_amount;
                    nestedData['createdAt'] = data.createdAt
                    nestedData['updatedAt'] = data.updatedAt

                    packagesData.push(nestedData);
                })

                var totalRecords = query1
            }
            catch (err) {
                console.log(err);
            }
        }
        res.json({
            draw: req.query.draw ? parseInt(req.query.draw) : 1,
            recordsTotal: totalRecords,
            recordsFiltered: totalRecords,
            data: packagesData
        });
    }

})

//recharge data api
router.get('/rechargeData', Admin_Auth, async (req, res) => {

    const { start, length, search, dataId } = req.query;
    const columns = [
        'sr',
        'transactionId',
        'status',
        'paymentMethod',
        'amount',
        'userId',
        'Compaint',
        'createdAt',

    ];


    if (start && length) {
        if (start && length) {

            try {
                const query = RechargeDetailsSchema.find()
                const query1 = await RechargeDetailsSchema.find().countDocuments()


                if (req.query.search && req.query.search.value) {
                    const searchValue = req.query.search.value;

                    query.or([
                        {
                            $expr: {
                                $regexMatch: {
                                    input: { $toString: `$userId` },
                                    regex: new RegExp(parseInt(searchValue))
                                }
                            }
                        },
                        {
                            $expr: {
                                $regexMatch: {
                                    input: { $toString: `$transactionId` },
                                    regex: new RegExp(parseInt(searchValue))
                                }
                            }
                        },
                        {
                            $expr: {
                                $regexMatch: {
                                    input: { $toString: `$status` },
                                    regex: new RegExp(parseInt(searchValue))
                                }
                            }
                        },
                        {
                            $expr: {
                                $regexMatch: {
                                    input: { $toString: `$amount` },
                                    regex: new RegExp(parseInt(searchValue))
                                }
                            }
                        },
                    ]);
                }

                if (req.query.order && req.query.order[0] && req.query.order[0].column) {
                    const sortColumn = columns[req.query.order[0].column];
                    const sortDir = req.query.order[0].dir === 'asc' ? 1 : -1;
                    query.sort({ [sortColumn]: sortDir });
                }

                query.skip(Number(req.query.start));
                query.limit(Number(req.query.length));

                var results = await query.exec();
                var packagesData = []

                results.map((data, index) => {
                    var nestedData = {};
                    nestedData['sr'] = index
                    nestedData['transactionId'] = data.transactionId
                    nestedData['status'] = data.status;
                    nestedData['paymentMethod'] = data.paymentMethod;
                    nestedData['amount'] = data.amount;
                    nestedData['userId'] = data.userId;
                    nestedData['Compaint'] = data.Compaint
                    nestedData['createdAt'] = data.createdAt

                    packagesData.push(nestedData);
                })

                var totalRecords = query1
            }
            catch (err) {
                console.log(err);
            }
        }
        res.json({
            draw: req.query.draw ? parseInt(req.query.draw) : 1,
            recordsTotal: totalRecords,
            recordsFiltered: totalRecords,
            data: packagesData
        });
    }

})

//withdraw details Api
router.get('/withdraw', Admin_Auth, async (req, res) => {

    const { start, length, search, dataId } = req.query;
    const columns = [
        'sr',
        'userId',
        'point',
        'fee',
        'name',
        'mode',
        'type',
        'ifsc',
        'account',
        'transferredAccount',
        'status',
        'date',
    ];


    if (start && length) {
        if (start && length) {

            try {
                const query = withdrawSchema.find()
                const query1 = await withdrawSchema.find().countDocuments()


                if (req.query.search && req.query.search.value) {
                    const searchValue = req.query.search.value;

                    query.or([
                        { "ifsc": new RegExp(searchValue, 'i') },
                        { "name": new RegExp(searchValue, 'i') },
                        {
                            $expr: {
                                $regexMatch: {
                                    input: { $toString: `$userId` },
                                    regex: new RegExp(parseInt(searchValue))
                                }
                            }
                        },
                        {
                            $expr: {
                                $regexMatch: {
                                    input: { $toString: `$point` },
                                    regex: new RegExp(parseInt(searchValue))
                                }
                            }
                        },
                        {
                            $expr: {
                                $regexMatch: {
                                    input: { $toString: `$fee` },
                                    regex: new RegExp(parseInt(searchValue))
                                }
                            }
                        },
                        {
                            $expr: {
                                $regexMatch: {
                                    input: { $toString: `$name` },
                                    regex: new RegExp(parseInt(searchValue))
                                }
                            }
                        },
                        {
                            $expr: {
                                $regexMatch: {
                                    input: { $toString: `$mode` },
                                    regex: new RegExp(parseInt(searchValue))
                                }
                            }
                        },
                        {
                            $expr: {
                                $regexMatch: {
                                    input: { $toString: `$type` },
                                    regex: new RegExp(parseInt(searchValue))
                                }
                            }
                        },
                        {
                            $expr: {
                                $regexMatch: {
                                    input: { $toString: `$ifsc` },
                                    regex: new RegExp(parseInt(searchValue))
                                }
                            }
                        },
                        {
                            $expr: {
                                $regexMatch: {
                                    input: { $toString: `$account` },
                                    regex: new RegExp(parseInt(searchValue))
                                }
                            }
                        },
                        {
                            $expr: {
                                $regexMatch: {
                                    input: { $toString: `$transferredAccount` },
                                    regex: new RegExp(parseInt(searchValue))
                                }
                            }
                        },
                        {
                            $expr: {
                                $regexMatch: {
                                    input: { $toString: `$date` },
                                    regex: new RegExp(parseInt(searchValue))
                                }
                            }
                        },
                        {
                            $expr: {
                                $regexMatch: {
                                    input: { $toString: `$status` },
                                    regex: new RegExp(parseInt(searchValue))
                                }
                            }
                        },
                    ]);
                }

                if (req.query.order && req.query.order[0] && req.query.order[0].column) {
                    const sortColumn = columns[req.query.order[0].column];
                    const sortDir = req.query.order[0].dir === 'asc' ? 1 : -1;
                    query.sort({ [sortColumn]: sortDir });
                }

                query.skip(Number(req.query.start));
                query.limit(Number(req.query.length));

                var results = await query.exec();
                var packagesData = []

                results.map((data, index) => {
                    var nestedData = {};
                    nestedData['sr'] = index
                    nestedData['userId'] = data.userId
                    nestedData['point'] = data.point;
                    nestedData['fee'] = data.fee;
                    nestedData['name'] = data.name;
                    nestedData['mode'] = data.mode;
                    nestedData['type'] = data.type
                    nestedData['ifsc'] = data.ifsc
                    nestedData['account'] = data.account
                    nestedData['transferredAccount'] = data.transferredAccount
                    nestedData['status'] = data.status
                    nestedData['date'] = data.date
                    nestedData['_id'] = data._id

                    packagesData.push(nestedData);
                })

                var totalRecords = query1
            }
            catch (err) {
                console.log(err);
            }
        }
        res.json({
            draw: req.query.draw ? parseInt(req.query.draw) : 1,
            recordsTotal: totalRecords,
            recordsFiltered: totalRecords,
            data: packagesData
        });
    }

})

//admin profile api
router.post('/profile', Admin_Auth, async (req, res) => {
    const { username } = req.body

    try {
        const user = await RegisterAdmin.findOne({ username: username })
        res.status(200).send(user)
    } catch (e) {
        console.log('error', e);
    }
})

//admin profile update Api
router.post('/profileupdate', Admin_Auth, async (req, res) => {
    const { uname, wallet, id } = req.body

    try {
        const data = await RegisterAdmin.findOneAndUpdate({ _id: id },
            {
                $set: {
                    username: uname,
                    wallet: wallet
                }
            })
        await data.save()
        res.status(200).json('data save')
    } catch (e) {
    }
})

//password change api
router.post('/changepassword', Admin_Auth, async (req, res) => {
    const { password, newpassword, name } = req.body
    if (!password || !newpassword || !name) {
        return res.status(401).send("Error : please fill the data")
    }

    const data = await RegisterAdmin.findOne({ username: name })
    if (data) {
        const match = await bcrypt.compare(password, data.password)
        if (match) {
            var n_psd = await bcrypt.hash(newpassword, 10)
            const update = await RegisterAdmin.findOneAndUpdate({ username: name },
                {
                    $set: {
                        password: n_psd

                    }
                })
            await update.save()
            res.status(200).json({ message: 'data save' })
        } else {
            res.status(400).json({ message: 'old password not match' })
        }
    }

})

//transaction data api
router.post('/transaction', Admin_Auth, async (req, res) => {
    try {
        const { tr_id } = req.body
        const match = await RechargeDetailsSchema.findOne({ transactionId: tr_id })
        res.json(match)



    } catch (e) {
        console.log(e);
    }
})

//status update api
router.post('/status', Admin_Auth, async (req, res) => {
    try {
        const { num, _id } = req.body
        const match = await RechargeDetailsSchema.findOneAndUpdate({ _id: _id }, {
            $set: {
                status: num
            }
        })
        res.status(200).json({ message: 'status save ' })


    } catch (e) {
        console.log(e);
    }
})

//wallet data api
router.get('/wallet', Admin_Auth, async (req, res) => {

    const data = await WalletSchema.find()
    res.json(data)
})

//all upidata api
router.get('/upidata', Admin_Auth, async (req, res) => {

    // const data = await RechargeTypeSchema.find()
    // res.status(200).json(data)

    const { start, length, search } = req.query;
    const columns = [
        'sr',
        'paymentMethod',
        'account',
        'id',
     

    ];


    if (start && length) {
        if (start && length) {

            try {
                const query = RechargeTypeSchema.find()

                if (req.query.search && req.query.search.value) {
                    const searchValue = req.query.search.value;

                    query.or([
                        { "paymentMethod": new RegExp(searchValue, 'i') },
                        { "account": new RegExp(searchValue, 'i') },

                        {
                            $expr: {
                                $regexMatch: {
                                    input: { $toString: `$account` },
                                    regex: new RegExp(parseInt(searchValue))
                                }
                            }
                        },
                        {
                            $expr: {
                                $regexMatch: {
                                    input: { $toString: `$paymentMethod` },
                                    regex: new RegExp(parseInt(searchValue))
                                }
                            }
                        },
                    ]);
                }

                if (req.query.order && req.query.order[0] && req.query.order[0].column) {
                    const sortColumn = columns[req.query.order[0].column];
                    const sortDir = req.query.order[0].dir === 'asc' ? 1 : -1;
                    query.sort({ [sortColumn]: sortDir });
                }

                query.skip(Number(req.query.start));
                query.limit(Number(req.query.length));

                var results = await query.exec();
                var packagesData = []

                results.map((data, index) => {
                    var nestedData = {};
                    nestedData['sr'] = index
                    nestedData['paymentMethod'] = data.paymentMethod
                    nestedData['account'] = data.account;
                    nestedData['id'] = data._id


                    packagesData.push(nestedData);
                })

                var totalRecords = results.length
            }
            catch (err) {
                console.log(err);
            }
        }
        res.json({
            draw: req.query.draw ? parseInt(req.query.draw) : 1,
            recordsTotal: totalRecords,
            recordsFiltered: totalRecords,
            data: packagesData
        });
    }

})

//addUpi api
router.post('/addupi', Admin_Auth, upload.single('qrcode'), async (req, res) => {
    const { type, upi } = req.body

    if (!type || !upi) {
        return res.status(400).send("Error : please fill the data")
    }

    const user = new RechargeTypeSchema({ paymentMethod: type, account: upi, qrcode: `http://localhost:7000/avtar/${req.file.filename}` })
    await user.save()
    res.status(200).json({ message: "data save" })

})

//one upi data api
router.post('/userupidata', Admin_Auth, async (req, res) => {
    const { dataid } = req.body
    const data = await RechargeTypeSchema.find({ _id: dataid })
    res.json(data)
})

//upiData Update Api
router.post('/upidataupdate', Admin_Auth, upload.single('qrcode'), async (req, res) => {
    const { dataid, type, upi } = req.body

    if (!req.file) {
        const image = await RechargeTypeSchema.find({ _id: dataid })
        const imgdata = image[0].qrcode

        const data = await RechargeTypeSchema.findOneAndUpdate({ _id: dataid }, {
            $set: {
                qrcode: imgdata,
                paymentMethod: type,
                account: upi
            }
        })

        res.status(200).json(data)

    }

    else {

        const user = await RechargeTypeSchema.find({ _id: dataid })
        const string = user[0].qrcode.substr(28)

        fs.unlink(`images/${string}`, (res) => {
            if (res) {
            }
        })
        const data = await RechargeTypeSchema.findOneAndUpdate({ _id: dataid }, {
            $set: {
                qrcode: `http://localhost:7000/avtar/${req.file.filename}`,
                paymentMethod: type,
                account: upi
            }
        })
        res.status(200).json(data)
    }




})

//upi delete api
router.post('/upidelete', Admin_Auth, async (req, res) => {
    const { _id } = req.body
    const data = await RechargeTypeSchema.findOneAndRemove({ _id })
    res.status(200).json('data delete')
})

//task Reword api
router.get('/taskreword', Admin_Auth, async (req, res) => {

    const { start, length } = req.query;
    const columns = [
        'sr',
        'task',
        'description',
        'date',
        'points',
        'status',
        'range',
        'order',
        'type',
        '_id',

    ];


    if (start && length) {
        if (start && length) {

            try {
                const query = TaskRewardSchema.find()
                if (req.query.search && req.query.search.value) {
                    const searchValue = req.query.search.value;
                    query.or([
                        { "task": new RegExp(searchValue, 'i') },
                        { "description": new RegExp(searchValue, 'i') },

                        {
                            $expr: {
                                $regexMatch: {
                                    input: { $toString: `$points` },
                                    regex: new RegExp(parseInt(searchValue))
                                }
                            }
                        },
                        {
                            $expr: {
                                $regexMatch: {
                                    input: { $toString: `$status` },
                                    regex: new RegExp(parseInt(searchValue))
                                }
                            }
                        },
                        {
                            $expr: {
                                $regexMatch: {
                                    input: { $toString: `$range` },
                                    regex: new RegExp(parseInt(searchValue))
                                }
                            }
                        },
                        {
                            $expr: {
                                $regexMatch: {
                                    input: { $toString: `$order` },
                                    regex: new RegExp(parseInt(searchValue))
                                }
                            }
                        },
                        {
                            $expr: {
                                $regexMatch: {
                                    input: { $toString: `$type` },
                                    regex: new RegExp(parseInt(searchValue))
                                }
                            }
                        },
                    ]);
                }

                if (req.query.order && req.query.order[0] && req.query.order[0].column) {
                    const sortColumn = columns[req.query.order[0].column];
                    const sortDir = req.query.order[0].dir === 'asc' ? 1 : -1;
                    query.sort({ [sortColumn]: sortDir });
                }

                query.skip(Number(req.query.start));
                query.limit(Number(req.query.length));

                var results = await query.exec();
                var packagesData = []

                results.map((data, index) => {
                    var nestedData = {};
                    // res.json(data.odp.amount)
                    nestedData['sr'] = index
                    nestedData['task'] = data.task
                    nestedData['description'] = data.description;
                    nestedData['date'] = data.date
                    nestedData['points'] = data.points
                    nestedData['status'] = data.status
                    nestedData['range'] = data.range
                    nestedData['order'] = data.order
                    nestedData['type'] = data.type
                    nestedData['_id'] = data._id
                    packagesData.push(nestedData);
                })

                var totalRecords = results.length
            }
            catch (err) {
                console.log(err);
            }
        }
        res.json({
            draw: req.query.draw ? parseInt(req.query.draw) : 1,
            recordsTotal: totalRecords,
            recordsFiltered: totalRecords,
            data: packagesData
        });
    }




})

//delete task api
router.post('/taskdelete', Admin_Auth, async (req, res) => {
    const { _id } = req.body
    const data = await TaskRewardSchema.findOneAndRemove({ _id })
    res.status(200).json('data delete')
})

//add task api
router.post('/addtask', Admin_Auth, upload.single('image'), async (req, res) => {
    const { task, description, points, status, order, type, range } = req.body

    if (!task || !description || !points || !status || !order || !type || !range) {
        return res.status(400).send("Error : please fill the data")
    }



    let inputFile = req.file.path;
    let outputFile = 'images/54x54_' + req.file.filename;
    sharp(inputFile).resize({ height: 54, width: 54 }).toFile(outputFile)
        .then(function (newFileInfo) {
        })
        .catch(function (err) {
        });

    const data = new TaskRewardSchema({
        task: task,
        description: description,
        points: points,
        status: status,
        order: order,
        type: type,
        range: range,
        image: `http://localhost:7000/avtar/54x54_${req.file.filename}`


    })
    await data.save()
    res.status(200).json({ message: "data save" })
})

//all task get api
router.post('/gettask', Admin_Auth, async (req, res) => {
    const { _id } = req.body
    const data = await TaskRewardSchema.find({ _id })
    res.status(200).json(data)
})

//edit task api
router.post('/editreword', Admin_Auth, upload.single('image'), async (req, res) => {
    const { task, description, points, status, order, type, range, _id } = req.body


    if (req.file) {

        let inputFile = req.file.path;
        let outputFile = 'images/54x54_' + req.file.filename;
        sharp(inputFile).resize({ height: 54, width: 54 }).toFile(outputFile)
            .then(function (newFileInfo) {
            })
            .catch(function (err) {
            });



        const data = await TaskRewardSchema.findOneAndUpdate({ _id }, {
            $set: {
                task: task,
                description: description,
                points: points,
                status: status,
                order: order,
                type: type,
                range: range,
                image: `http://localhost:7000/avtar/54x54_${req.file.filename}`
            }
        })
    }

    else {
        const data = await TaskRewardSchema.findOneAndUpdate({ _id }, {
            $set: {
                task: task,
                description: description,
                points: points,
                status: status,
                order: order,
                type: type,
                range: range,
                // image: `http://localhost:7000/avtar/54x54_${req.file.filename}`
            }
        })

    }

    res.status(200).json({ message: "data save" })

})

//withdraw status update api
router.post('/withdrawstatus', Admin_Auth, async (req, res) => {
    const { status, _id } = req.body
    const data = await withdrawSchema.findOneAndUpdate({ _id }, {
        $set: {
            status: status
        }
    })
    res.status(200).json({ message: "data save" })

})

//add setting api
router.post('/addSetting', Admin_Auth, upload.single('image'), async (req, res) => {
    const { web_config_name } = req.body
    const data = new WebConfigModel({
        web_config_name, web_config_value: `http://localhost:7000/avtar/${req.file.filename}`
    })
    await data.save()
    res.status(200).json({ message: 'data save' })
})

//get setting data api
router.get('/SettingData', Admin_Auth, async (req, res) => {
    const data = await WebConfigModel.find()
    res.status(200).json(data)
})

////update setting api
router.post('/updateSetting', Admin_Auth, upload.single('image'), async (req, res) => {
    const { logoId, value, footerId, footer, footerValue } = req.body

    if (!req.file) {
        const logo = await WebConfigModel.findOneAndUpdate({ _id: logoId },
            {
                $set: {
                    web_config_name: value,
                }
            })
        const footerData = await WebConfigModel.findOneAndUpdate({ _id: footerId },
            {
                $set: {
                    web_config_name: footer,
                    web_config_value: footerValue,
                }
            })

        res.status(200).json({ message: 'data save' })
    }
    else {

        const user = await WebConfigModel.find({ _id: logoId })
        const string = user[0].web_config_value.substr(28)

        fs.unlink(`images/${string}`, (res) => {
            if (res) {
                console.log("unlink");
            }
        })
        const data = await WebConfigModel.findOneAndUpdate({ _id: logoId }, {
            $set: {
                web_config_value: `http://localhost:7000/avtar/${req.file.filename}`,
                web_config_name: value,
            }
        })
        const footerData = await WebConfigModel.findOneAndUpdate({ _id: footerId },
            {
                $set: {
                    web_config_name: footer,
                    web_config_value: footerValue,
                }
            })
        res.status(200).json({ message: 'data save' })

    }




})

//new game add api
router.post('/AddGame', Admin_Auth, upload.single('image'), async (req, res) => {
    const { name } = req.body
    const data = new AllGamesModel({ game_name: name, game_logo: `http://localhost:7000/avtar/${req.file.filename}` })
    await data.save()
    res.status(200).json(data)
})

//get game details api
router.get('/allGame', Admin_Auth, async (req, res) => {
    const data = await AllGamesModel.find()
    res.status(200).json(data)

})

//game status change api
router.post('/gameStatus', Admin_Auth, async (req, res) => {

    const { status, dataId } = req.body

    const data = await AllGamesModel.findOneAndUpdate({ _id: dataId }, {
        $set: {
            game_status: status
        }
    })
    await data.save()
    res.status(200).json(data)

})

//one game data api
router.post('/OneGame', Admin_Auth, async (req, res) => {
    const { dataid } = req.body
    const data = await AllGamesModel.findOne({ _id: dataid })
    res.status(200).json(data)
})

//one game data update api
router.post('/OneGameUpdate', Admin_Auth, upload.single('image'), async (req, res) => {
    const { dataid, name } = req.body

    if (!req.file) {
        const data = await AllGamesModel.findOneAndUpdate({ _id: dataid },
            {
                $set: {
                    game_name: name,
                }
            })
        res.status(200).json({ message: 'data save' })
    }
    else {

        const user = await AllGamesModel.find({ _id: dataid })
        const string = user[0].game_logo.substr(28)

        fs.unlink(`images/${string}`, (res) => {
            if (res) {
                console.log("unlink");
            }
        })
        const data = await AllGamesModel.findOneAndUpdate({ _id: dataid }, {
            $set: {
                game_name: name,
                game_logo: `http://localhost:7000/avtar/${req.file.filename}`
            }
        })
        res.status(200).json({ message: 'data save' })

    }
    // res.status(200).json(data)
})

// router.get("/homePage", Admin_Auth, async (req, res) => {
//     const data = await AllGamesModel.find()
//     res.status(200).json(data)

// })


module.exports = router;    