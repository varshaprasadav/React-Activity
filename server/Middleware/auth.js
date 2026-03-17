import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const authenticate=(req,res,next)=>{
  const cookie= req.headers.cookie;
  console.log(cookie);

  if(cookie){
    const [name,token] = cookie.trim().split('=');
    console.log(name);
    console.log(token);
    if(name=='authToken'){
      const verified = jwt.verify(token,process.env.SECRET_KEY);
      console.log(verified);
      req.user = verified.UserName;
      req.role = verified.UserRole;
      next();
    }
    else{
      res.status(401).send("Unauthorized access");
    }
  }
  else{
    res.status(401).send("Unauthorized access");
  }
}

export default authenticate;
