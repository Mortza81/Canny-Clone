const nodemailer = require('nodemailer')
module.exports=class Email{
  constructor(user){
    this.to=user.email
    this.firstName=user.name.split(' ')[0]
    this.from=`Moretza Ahmadi <${process.env.EMAIL_FROM}>`
  }
  newTransport(){
    if(process.env.NODE_ENV=='production'){
      return nodemailer.createTransport({
        service:'gmail',
        auth:{
          user:process.env.GMAIL_USER,
          pass:process.env.GMAIL_PASSWORD
        }
      })
    }
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    })

  }
  async send(text,subject){
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      text
    }
    await this.newTransport().sendMail(mailOptions)
  }
}
