const router = require("express").Router();
const auth = require("../middleware/auth")
const {
    userWinSaved, homePage, userWinDataSaved, InviteDetails, GrowthStatusDetails, GrowthDetails, RankingUserDetails, RechargeDetails, IncomeUserDetails, MineSweeperOrder, MineSweeperUserOrder, LuckyRupeesDetail, InvitePeopleMobileDetails, InvitePeopleDetails, InviteLinkDetails, IncomeDetails, MyAccountFinancialDetails, CheckInRewardSaved, MyAccountDetails, MyAccountModifyDetails, CheckInTakeRewardSaved, CheckInPostRewardSaved, ProbilitySaved, TaskRewardStatusSaved, TaskRewardSaved, UserWithdrawDataSaved, UserWithdrawDataCancelSaved, UserAccountDataSaved, UserWithdrawSaved, UserAccountDataDeleteSaved, AddAccountSaved, RechargeAmountTransStatusSaved, RechargeDataSaved, RechargeDataAllSaved, UploadImageSaved, MoreFastParitySaved, WalletAmountSaved, userOrderSaved, RechargeAmountSaved, RechargeDetailSaved, RechargeAmountTransSaved, ComplaintDetails, CrashUserOrder
} = require("../controllers/Main.controller")




//home page data
router.get("/homePage", auth, homePage);


//DUMMY DATA ADD AND SHOW OF WIN USER
router.post("/userwin", userWinSaved);
router.get("/user_win", userWinDataSaved);

// FAST PARITY GAME 
router.get("/probability", auth, ProbilitySaved);
router.get("/more/fastparity", auth, MoreFastParitySaved);
router.get("/userOrder/:id/", auth, userOrderSaved);

// MAIN WALLET DATA 
router.get("/walletAmount/:id", auth, WalletAmountSaved);

// RECHARGE DATA 
router.post("/commodity/trade/buy_r", auth, RechargeAmountSaved)
router.get("/commodity/trade/order/detail", auth, RechargeDetailSaved)
router.get("/commodity/trade/order/transaction/:transactionId", auth, RechargeDataSaved)
router.get("/commodity/trade/order/transactionUser/:userId", auth, RechargeDataAllSaved)
router.post("/commodity/trade/order/tranferred", auth, RechargeAmountTransSaved)
router.post("/upload_img", auth, UploadImageSaved)
router.post("/recharge", auth, RechargeDetails)
router.post("/complaint", auth, ComplaintDetails)

router.post("/commodity/trade/order/tranferredStatus", auth, RechargeAmountTransStatusSaved)

// WITHDRAW DATA 
router.post("/withdraw/account/add", auth, AddAccountSaved)
router.get("/withdraw/account/:userId", auth, UserAccountDataSaved)
router.post("/withdraw/account/delete", auth, UserAccountDataDeleteSaved)
router.post("/withdraw/account", auth, UserWithdrawSaved)
router.get("/withdraw/account/data/:userId", auth, UserWithdrawDataSaved)
router.get("/withdraw/account/cancel/:id", auth, UserWithdrawDataCancelSaved)

// TAST REWARD DATA 
router.get("/taskreward/:userId", auth, TaskRewardSaved)
router.post("/taskreward/status", auth, TaskRewardStatusSaved)

// CHECK IN REWARD 
router.get("/checkin/info/:id", auth, CheckInRewardSaved)
router.post("/checkin/info/reward", auth, CheckInPostRewardSaved)
router.post("/checkin/reward", auth, CheckInTakeRewardSaved)

// MY ACCOUNT 
router.post("/my_account/modify", auth, MyAccountModifyDetails)
router.get("/my_account/:userId", auth, MyAccountDetails)
router.get("/my_account/financial/:id", auth, MyAccountFinancialDetails)


// INVITE 
router.get("/balance/:userId", auth, InviteDetails)
router.get("/incomedetails/:userId/:type", auth, IncomeDetails)
router.get("/inviteLink/:userId", auth, InviteLinkDetails)
router.get("/invitePeople/:userId", auth, InvitePeopleDetails)
router.get("/invitePeopleMobile/:userId", InvitePeopleMobileDetails)
router.get("/income/:userId", auth, IncomeUserDetails)
router.get("/RankerDetails", auth, RankingUserDetails)
router.get("/growthDetail/:id", auth, GrowthDetails)
router.post("/growthDetail/status", auth, GrowthStatusDetails)



router.post("/luckyRupees", LuckyRupeesDetail)


// MINESWEEPER 
router.post("/minesweeper/order", auth, MineSweeperOrder)
router.get("/minesweeper/user/order/:userId", auth, MineSweeperUserOrder)


//CRASH

router.post("/crash/user/order/:userId", auth, CrashUserOrder)



module.exports = router;