const ObjectId = require("mongodb").ObjectId;
const RegisterModel = require("../models/Register.model")
const WalletModel = require("../models/Wallet.model")
const bcrypt = require("bcrypt")
var nodejsUniqueNumericIdGenerator = require("nodejs-unique-numeric-id-generator");
const UserTaskRewardDetailsModel = require("../models/UserTaskRewardDetails.model");
const TaskrewardDetailsModel = require("../models/TaskrewardDetails.model");
const CheckInModel = require("../models/CheckIn.model");
const AgentWalletModel = require("../models/AgentWallet.model");
const InviteLinkModel = require("../models/InviteLink.model");
const { encrypt, decrypt } = require('./Crpto.js');
const IncomeDetailsModel = require("../models/IncomeDetails.model");
const InvitePeopleModel = require("../models/InvitePeople.model");
const userAccountDetailModel = require("../models/userAccountDetail.model");
const UserGrowthPlanModel = require("../models/UserGrowthPlan.model");

require("dotenv").config()

exports.RegisterSaved = async (req, res) => {
  try {
    const socket= req.app.get("socketio")

    const number = await RegisterModel.find({ mobile_no: req.body.mobile_no })
    if (number.length) {
      res.status(201).json({
        status: false,
        message: "Number is already register"
      })
    }
    else {
      const RegisterData = new RegisterModel({
        mobile_no: req.body.mobile_no,
        password: req.body.password,
        inviterId: req.body.id ? decrypt(req.body.id) : "",
        userId: Math.floor(
          Math.random() * (99999999 - 10000000 + 1) + 10000000
        )
      });
      const saveData = await RegisterData.save();
      const growth = await UserGrowthPlanModel.insertMany([{
        userId: saveData.userId,
        leval: "1",
        status: "0",
        point: 3
      },
      {
        userId: saveData.userId,
        leval: "2",
        status: "3",
        point: 50
      },
      {
        userId: saveData.userId,
        leval: "3",
        status: "3",
        point: 300
      },
      {
        userId: saveData.userId,
        leval: "4",
        status: "3",
        point: 1500
      },
      {
        userId: saveData.userId,
        leval: "5",
        status: "3",
        point: 4000
      },
      {
        userId: saveData.userId,
        leval: "6",
        status: "3",
        point: 10000
      },
      {
        userId: saveData.userId,
        leval: "7",
        status: "3",
        point: 1000000
      }])
      // await growth.save()
      if (saveData.inviterId) {
        const user_id = decrypt(req.body.id)
        const agentUser = await AgentWalletModel.find({ userId: user_id })
        const years = new Date(agentUser[0].updatedAt).getFullYear().toString().slice(-2);
        const months = ("0" + (new Date(agentUser[0].updatedAt).getMonth() + 1)).toString().slice(-2)
        const day = String(new Date(agentUser[0].updatedAt).getDate()).padStart(2, '0');
        const fullDate = years + "-" + months + "-" + day
        const year1 = new Date().getFullYear().toString().slice(-2);
        const month1 = ("0" + (new Date().getMonth() + 1)).toString().slice(-2)
        const days = String(new Date().getDate()).padStart(2, '0');
        const fullDate1 = year1 + "-" + month1 + "-" + days
      //  ELIGIBLE FOR 1 LEVAL GROWTH PLAN 
         const growth = await UserGrowthPlanModel.updateMany({
           userId: saveData.inviterId,leval:"1"},{status: "1"}
          
         )
        const leval1Data = await RegisterModel.find({ userId: saveData.inviterId })
        if (leval1Data[0].inviterId == "") {

          const invitePeople = new InvitePeopleModel({
            leval: 1,
            userId: decrypt(req.body.id),
            InviteeUserId: saveData.userId,
            Type: 1
          })
          await invitePeople.save();
          if (fullDate == fullDate1) {

            const IncomeAgent = await AgentWalletModel.updateMany({

              userId: decrypt(req.body.id),

            }, { amount: Number(agentUser[0].amount) + 1.00, TodayInvite: agentUser[0].TodayInvite + 1 });
          }
          else {
            const IncomeAgent = await AgentWalletModel.updateMany({

              userId: decrypt(req.body.id),

            }, { amount: Number(agentUser[0].amount) + 1.00, TodayInvite: 1 });
          }
          const Income = new IncomeDetailsModel({
            points: 1.00,
            userId: decrypt(req.body.id),
            tradeType: 55,
            comment: "Invite cash back",
            participantUserId: saveData.userId,
            image: `${process.env.MAIN_URL}/avtar/Cash.png`,
            participantUserName: saveData.mobile_no,
          });
          const saveData1 = await Income.save();

          // socket.emit("invite-alert",{point:1.00,userId:decrypt(req.body.id)})
          socket.emit("invite-id",{point:1.00,userId:decrypt(req.body.id)})
          

        }
        else {
          const leval2Data = await RegisterModel.find({ userId: leval1Data[0].inviterId })
          if (leval2Data[0].inviterId == "") {
            const invitePeople1 = new InvitePeopleModel({
              leval: 1,
              userId: decrypt(req.body.id),
              InviteeUserId: saveData.userId,
              Type: 1
            })
            await invitePeople1.save();
            const invitePeople = new InvitePeopleModel({
              leval: 2,
              userId: leval1Data[0].inviterId,
              InviteeUserId: saveData.userId,
              Type: 1
            })
            await invitePeople.save();
            const agentUser1 = await AgentWalletModel.find({ userId: leval1Data[0].inviterId })
            if (fullDate == fullDate1) {

              const IncomeAgent = await AgentWalletModel.updateMany({

                userId: { $in: [decrypt(req.body.id)] }

              }, { amount: Number(agentUser[0].amount) + 1.00, TodayInvite: agentUser[0].TodayInvite + 1 });
              const IncomeAgent1 = await AgentWalletModel.updateMany({

                userId: { $in: [leval1Data[0].inviterId] }

              }, { amount: Number(agentUser1[0].amount), TodayInvite: agentUser1[0].TodayInvite + 1 });
            }
            else {
              const IncomeAgent = await AgentWalletModel.updateMany({
                userId: { $in: [decrypt(req.body.id)] }
              }, { amount: Number(agentUser1[0].amount) + 1.00, TodayInvite: 1 });
              const IncomeAgent1 = await AgentWalletModel.updateMany({
                userId: { $in: [leval1Data[0].inviterId] }
              }, { amount: Number(agentUser1[0].amount), TodayInvite: 1 });
            }
            const Income = new IncomeDetailsModel({
              points: 1.00,
              userId: decrypt(req.body.id),
              tradeType: 55,
              comment: "Invite cash back",
              participantUserId: saveData.userId,
              image: `${process.env.MAIN_URL}/avtar/Cash.png`,
              participantUserName: saveData.mobile_no,
            });
            const saveData1 = await Income.save();
            // socket.emit("invite-alert",{point:1.00,userId:decrypt(req.body.id)})
            socket.emit("invite-id",{point:1.00,userId:decrypt(req.body.id)})

            // const Income2 = new IncomeDetailsModel({
            //   points: 1.00,
            //   userId: leval1Data[0].inviterId,
            //   tradeType: 55,
            //   comment: "Invite cash back",
            //   participantUserId: saveData.userId,
            //   image: `${process.env.MAIN_URL}/avtar/Cash.png`,
            //   participantUserName: saveData.mobile_no,
            // });
            // await Income2.save();
          }
          else {
            const invitePeople1 = new InvitePeopleModel({
              leval: 1,
              userId: decrypt(req.body.id),
              InviteeUserId: saveData.userId,
              Type: 1
            })
            await invitePeople1.save();
            const invitePeople2 = new InvitePeopleModel({
              leval: 2,
              userId: leval1Data[0].inviterId,
              InviteeUserId: saveData.userId,
              Type: 1
            })
            await invitePeople2.save();
            const invitePeople = new InvitePeopleModel({
              leval: 3,
              userId: leval2Data[0].inviterId,
              InviteeUserId: saveData.userId,
              Type: 1
            })
            await invitePeople.save();
            const agentUser1 = await AgentWalletModel.find({ userId: leval1Data[0].inviterId })
            const agentUser3 = await AgentWalletModel.find({ userId: leval2Data[0].inviterId })

            if (fullDate == fullDate1) {

              const IncomeAgent = await AgentWalletModel.updateMany({

                userId: decrypt(req.body.id)

              }, { amount: Number(agentUser[0].amount) + 1.00, TodayInvite: agentUser[0].TodayInvite + 1 });
              const IncomeAgent1 = await AgentWalletModel.updateMany({

                userId: leval1Data[0].inviterId

              }, { amount: Number(agentUser1[0].amount), TodayInvite: agentUser1[0].TodayInvite + 1 });
              const IncomeAgent2 = await AgentWalletModel.updateMany({

                userId: leval2Data[0].inviterId

              }, { amount: Number(agentUser3[0].amount), TodayInvite: agentUser3[0].TodayInvite + 1 });
            }
            else {
              const IncomeAgent = await AgentWalletModel.updateMany({

                userId: { $in: [decrypt(req.body.id)] }


              }, { amount: Number(agentUser[0].amount) + 1.00, TodayInvite: 1 });
              const IncomeAgent1 = await AgentWalletModel.updateMany({

                userId: leval1Data[0].inviterId


              }, { amount: Number(agentUser1[0].amount), TodayInvite: 1 });
              const IncomeAgent2 = await AgentWalletModel.updateMany({

                userId: leval2Data[0].inviterId


              }, { amount: Number(agentUser3[0].amount), TodayInvite: 1 });
            }
            const Income = new IncomeDetailsModel({
              points: 1.00,
              userId: decrypt(req.body.id),
              tradeType: 55,
              comment: "Invite cash back",
              participantUserId: saveData.userId,
              image: `${process.env.MAIN_URL}/avtar/Cash.png`,
              participantUserName: saveData.mobile_no,
            });
            const saveData1 = await Income.save();
            // socket.emit("invite-alert",{point:1.00,userId:decrypt(req.body.id)})
            socket.emit("invite-id",{point:1.00,userId:decrypt(req.body.id)})
            // const Income2 = new IncomeDetailsModel({
            //   points: 1.00,
            //   userId: leval1Data[0].inviterId,
            //   tradeType: 55,
            //   comment: "Invite cash back",
            //   participantUserId: saveData.userId,
            //   image: `${process.env.MAIN_URL}/avtar/Cash.png`,
            //   participantUserName: saveData.mobile_no,
            // });
            // await Income2.save();
            // const Income3 = new IncomeDetailsModel({
            //   points: 1.00,
            //   userId: leval2Data[0].inviterId,
            //   tradeType: 55,
            //   comment: "Invite cash back",
            //   participantUserId: saveData.userId,
            //   image: `${process.env.MAIN_URL}/avtar/Cash.png`,
            //   participantUserName: saveData.mobile_no,
            // });
            // await Income3.save();
          }

        }
      }

      if (req.body.id) {
        const userAccountData = new userAccountDetailModel({
          userId: saveData.userId, comment: "Get a Lucky Rupees",
          tradeType: "1",
          points: "10.00",
          image: `${process.env.MAIN_URL}/avtar/happyRupee.png`,
          type: "lucky",
          date: Date.parse(new Date())
        });
        await userAccountData.save();
      }

      const AgentWalletData = new AgentWalletModel({
        amount: "0.00",
        userId: saveData.userId
      })
      await AgentWalletData.save();

      const aa = encrypt((saveData.userId).toString())
      const LinkData = new InviteLinkModel({
        invite_link: aa,
        userId: saveData.userId
      })
      await LinkData.save();

      const accesstoken = await RegisterData.generateAccessToken()

      const WalletData = new WalletModel({
        amount: req.body.id && 10.00,
        userId: saveData.userId
      })
      await WalletData.save();

      const taskData = await TaskrewardDetailsModel.find()
      taskData.map(async (data) => {
        const taskDatas = new UserTaskRewardDetailsModel({ status: data.status, task: data.task, description: data.description, order: data.order, points: data.points, range: data.range, image: data.image, type: data.type, userId: saveData.userId })
        await taskDatas.save();
      })

      const year = new Date().getFullYear().toString().slice(-2);
      const month = ("0" + (new Date().getMonth() + 1)).toString().slice(-2)
      const day1 = new Date(new Date().setDate(new Date().getDate())).getDate()
      const day2 = new Date(new Date().setDate(new Date().getDate() + 1)).getDate()
      const day3 = new Date(new Date().setDate(new Date().getDate() + 2)).getDate()
      const day4 = new Date(new Date().setDate(new Date().getDate() + 3)).getDate()
      const day5 = new Date(new Date().setDate(new Date().getDate() + 4)).getDate()
      const day6 = new Date(new Date().setDate(new Date().getDate() + 5)).getDate()
      const day7 = new Date(new Date().setDate(new Date().getDate() + 6)).getDate()


      const dates = [year +"-"+ month +"-"+ day1, year +"-"+ month +"-"+ day2, year +"-"+ month +"-"+ day3, year +"-"+ month + "-"+day4, year +"-"+ month + "-"+day5, year +"-"+ month +"-"+ day6, year + "-"+month +"-"+ day7,]
      dates.map(async (data, index) => {

        const checkIn = new CheckInModel({
          userId: saveData.userId,
          checkInDate: data,
          index: index + 1,
          todayCheckIn: false,
          coin: index == 0 ? "1" : index == 1 || index == 2 || index == 3 ? "2" : "3"
        })
        await checkIn.save()
      })

      res.status(201).json({
        status: true,
        message: "Register Successfully "
      })
    }

  } catch (error) {
    res.status(401).json({
      status: false,
      message: error
    })
  }
}

exports.LoginSaved = async (req, res) => {
  try {

    const { mobile_no, password, value } = req.body
    var userData = await RegisterModel.find({ mobile_no })
    if (value == "passwordLogin") {


      if (userData) {
        const cofirm = await bcrypt.compare(password, userData[0].password)
        const accesstoken = await userData[0].generateAccessToken()

        if (cofirm) {
          // res.cookie("user",userData.username)
          res.json({
            status: true,
            message: "Logging Successfully",
            mobile_no: userData[0].mobile_no,
            userId: userData[0].userId,
            avtar: userData[0].avtar,
            nickName: userData[0].nickName,
            _id: userData[0]._id,
            token: accesstoken
          })
        }
        else {
          res.json({
            status: false,
            message: "Invaild username and password ! Try again"
          })
        }
      }
      else {
        res.json({
          status: false,
          message: "Username is not Exist"
        })
      }
    }
    else {
      const accesstoken = await userData[0].generateAccessToken()
      res.json({
        status: true,
        message: "Logging Successfully",
        mobile_no: userData[0].mobile_no,
        userId: userData[0].userId,
        avtar: userData[0].avtar,
        nickName: userData[0].nickName,
        _id: userData[0]._id,
        token: accesstoken
      })
    }
  }

  catch (e) {
    res.json({
      status: false,
      message: "something went wrong"
    })
  }
}