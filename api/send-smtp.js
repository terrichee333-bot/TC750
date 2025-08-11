// 引入专业的邮件发送库 Nodemailer
const nodemailer = require('nodemailer');

// 这是Vercel Serverless Function的标准导出格式
module.exports = async (req, res) => {
  // 只接受POST请求
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // 从请求的Body中解构出邮件所需的所有信息
  const { smtp_host, smtp_port, smtp_user, smtp_pass, to, subject, body } = req.body;

  // 检查必要参数是否存在
  if (!smtp_host || !smtp_port || !smtp_user || !smtp_pass || !to || !subject || !body) {
    return res.status(400).json({ error: 'Missing required parameters in request body' });
  }

  // 创建一个邮件发送器 (transporter)，配置飞书SMTP服务
  const transporter = nodemailer.createTransport({
    host: smtp_host,
    port: smtp_port,
    secure: smtp_port === 465, // 如果端口是465，则使用SSL
    auth: {
      user: smtp_user, // 您的飞书邮箱
      pass: smtp_pass, // 您的SMTP专用密码
    },
  });

  // 邮件内容配置
  const mailOptions = {
    from: smtp_user, // 发件人地址
    to: to,         // 收件人地址
    subject: subject, // 邮件主题
    text: body,     // 邮件纯文本内容
    html: body.replace(/\n/g, '<br>'), // 将换行符转换成HTML换行，让邮件格式更好看
  };

  try {
    // 尝试发送邮件
    await transporter.sendMail(mailOptions);
    // 发送成功，返回200状态码和成功信息
    res.status(200).json({ message: 'Email sent successfully!' });
  } catch (error) {
    // 发送失败，打印错误日志（方便在Vercel后台排查问题）
    console.error('Error sending email:', error);
    // 返回500服务器错误和失败信息
    res.status(500).json({ error: 'Failed to send email.', details: error.message });
  }
};
