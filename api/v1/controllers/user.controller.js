const md5 = require("md5");
const User = require("../models/user.model");
const ForgotPassword = require("../models/forgot-password.model");
const generateHelper = require("../../../helpers/generate");
const sendMailHelper = require("../../../helpers/sendMail");

//[POST] /api/v1/users/register
module.exports.register = async (req, res) => {
  try{
    req.body.password = md5(req.body.password);

    const existEmail = await User.findOne({
      deleted: false,
      email: req.body.email
    });
  
    if(existEmail){
      res.json({
        code: 400,
        message: "Email đã tồn tại"
      });
    }else{
      const user = new User({
        fullName: req.body.fullName,
        email: req.body.email,
        password: req.body.password,
        token: generateHelper.generateRamdomString(30)
      });
      await user.save();
      
      const token = user.token;
      res.cookie("token", token);
  
      res.json({
        code: 200,
        message: "Đăng ký thành công",
        token: token
      });
    }
  }catch(error){
    res.json({
      code: 400,
      message: "Error"
    });
  }
}

//[POST] /api/v1/users/login
module.exports.login = async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
  
    const user = await User.findOne({
      deleted: false,
      email
    });
  
    if(!user){
      res.json({
        code: 400,
        message: "Email không tồn tại"
      });
      return;
    }
    
    if(md5(password) != user.password){
      res.json({
        code: 400,
        message: "Sai mật khẩu"
      });
      return;
    }
    
    const token = user.token;
    res.cookie("token", token);
  
    res.json({
      code: 200,
      message: "Đăng nhập thành công",
      token: token
    });
  } catch (error) {
    res.json({
      code: 400,
      message: "Error"
    });
  }
}

//[POST] /api/v1/users/password/forgot
module.exports.forgotPassword = async (req, res) => {
  try {
    const email = req.body.email;

    const user = await User.findOne({
      email: email,
      deleted: false
    });
  
    if(!user){
      res.json({
        code: 400,
        message: "Email không tồn tại"
      });
      return;
    }
    
    const otp = generateHelper.generateRamdomNumer(8);

    const timeExpire = 2;

    const objectForgotPassword = {
      email: email,
      otp: otp,
      expireAt: Date.now() + timeExpire*60
    };
  
    const forgotPassword = new ForgotPassword(objectForgotPassword);
    await forgotPassword.save();
    
    const subject = `Mã OTP xác minh lấy lại mật khẩu`;
    const html = `
      Mã OTP xác minh lấy lại mật khẩu là <b>${otp}</b>. 
      Thời hạn sử dụng là ${timeExpire} phút. 
      Lưu ý không được chia sẻ mã OTP với bất kỳ ai.
    `;

    sendMailHelper.sendMail(email, subject, html);

    res.json({
      code: 200,
      message: "Đã gửi mã OTP qua email"
    });
  } catch (error) {
    res.json({
      code: 400,
      message: "Error"
    });
  }
}

//[POST] /api/v1/users/password/otp
module.exports.otpPassword = async (req, res) => {
  try {
    const email = req.body.email;
    const otp = req.body.otp;

    const result = await ForgotPassword.findOne({
      email,
      otp
    });

    if(!result){
      res.json({
        code: 400,
        message: "OTP không hợp lệ"
      });
      return;
    }

    const user = await User.findOne({
      email: email,
      deleted: false
    });
  
    const token = user.token;
    res.cookie("token", token);

    res.json({
      code: 200,
      message: "Xác thực thành công"
    });
  } catch (error) {
    res.json({
      code: 400,
      message: "Error"
    });
  }
}

//[POST] /api/v1/users/password/reset
module.exports.resetPassword = async (req, res) => {
  try {
    const token = req.cookies.token;
    console.log(token);
    const password = req.body.password;

    const user = await User.findOne({
      token
    });

    if(md5(password) === user.password){
      res.json({
        code: 400,
        message: "Mật khẩu mới phải khác với mật khẩu cũ"
      });
      return;
    }

    await User.updateOne(
      {
        token
      },{
        password: md5(password)
      }
    );

    res.json({
      code: 200,
      message: "Đổi mật khẩu thành công"
    });
  } catch (error) {
    res.json({
      code: 400,
      message: "Error"
    });
  }
}

//[GET] /api/v1/users/detail
module.exports.detail = async (req, res) => {
  try {
    res.json({
      code: 200,
      message: "Thành công",
      info: req.user
    });
  } catch (error) {
    res.json({
      code: 400,
      message: "Error",
    });
  }
}

//[GET] /api/v1/users/list
module.exports.list = async (req, res) => {
  try {
    const users = await User.find({deleted: false}).select("fullName email");

    res.json({
      code: 200,
      message: "Thành công",
      users: users
    });
  } catch (error) {
    res.json({
      code: 400,
      message: "Error",
    });
  }
}