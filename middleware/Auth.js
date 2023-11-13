const jwt=require('jsonwebtoken')
const userAuth=async(req,res,next)=>{
    try {
        // console.log();
        const tokenwithBearear=req.headers['authorization'];
        if(!tokenwithBearear||!tokenwithBearear.startswith('Bearer ')){
            return res.status(401).json({message:'Authorization header missing or invalid',success:false})
        }
        const token=tokenwithBearear.split(' ')[1];
        jwt.verify(token,process.env.JWT_SECRET_KEY,(err,encoded)=>{
            if(err){
                return res.status(401).json({message:'Auth faild',success:false})
            }else if(encoded.role=='user'){
                req.id=encoded.id;
                next();
            }
        })
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: 'Internal Server Error', success: false });
    }
}
const adminAuth=async(req,res,next)=>{
    try {
        // console.log();
        const tokenwithBearear=req.headers['authorization'];
        if(!tokenwithBearear||!tokenwithBearear.startswith('Bearer ')){
            return res.status(401).json({message:'Authorization header missing or invalid',success:false})
        }
        const token=tokenwithBearear.split(' ')[1];
        jwt.verify(token,process.env.JWT_SECRET_KEY,(err,encoded)=>{
            if(err){
                return res.status(401).json({message:'Auth faild',success:false})
            }else if(encoded.role=='admin'){
                req.id=encoded.id;
                next();
            }
        })
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: 'Internal Server Error', success: false });
    }
}
const partnerAuth=async(req,res,next)=>{
    try {
        // console.log();
        const tokenwithBearear=req.headers['authorization'];
        if(!tokenwithBearear||!tokenwithBearear.startswith('Bearer ')){
            return res.status(401).json({message:'Authorization header missing or invalid',success:false})
        }
        const token=tokenwithBearear.split(' ')[1];
        jwt.verify(token,process.env.JWT_SECRET_KEY,(err,encoded)=>{
            if(err){
                return res.status(401).json({message:'Auth faild',success:false})
            }else if(encoded.role=='partner'){
                req.id=encoded.id;
                next();
            }
        })
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: 'Internal Server Error', success: false });
    }
}
module.exports={
    userAuth,
    adminAuth,
    partnerAuth
}