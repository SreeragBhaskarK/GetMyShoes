const {createNewUser,authenticateUser}=require("./controller")
module.exports={
    doSignUp(userData){
        return new Promise(async(resolve,reject)=>{
            try{
                let {name,email,password}=userData
                name=name.trim()
                email= email.trim()
                password = password.trim()

                if(!(name && email && password)){
                    throw Error ("Empty input fields!")

                }else if(!/^[a-zA-Z]*$/.test(name)){
                    throw Error("Invalid name entered")
                }else if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)){
                    throw Error("Invalid email entered")
                }else if(password.length<8){
                    throw Error("Password is too short!")
                }else{
                    // good credentials, create new user
                    const newUser = await createNewUser({
                        name,
                        email,
                        password
                    })
                    
                    resolve(newUser)
                }
            }
            catch(error){
                resolve(error.message)
            }
        })

    },
    doLogIn(userData){
        return new Promise(async(resolve,reject)=>{
            try{
                let {email,password}=userData
                email = email.trim()
                password = password.trim()

                if(!(email && password)){
                    throw Error ("Empty credentials supplied!")
                }
                console.log('//');
                const authenticateUsers = await authenticateUser({email,password})
              
                resolve(authenticateUsers)
            } catch(error){
                resolve(error.message)

            }
        })
    },
    doOTP(userData){
        return new Promise((resolve,reject)=>{
            try{
                const {email,subject,message,duration}=userData
            }
            catch(error){
                
            }
        })
    }
}