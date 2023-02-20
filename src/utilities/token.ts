import jwt from "jsonwebtoken"
import appDataSource from "../ormconfig"
import User from "../entities/user";
import RefreshToken from "../entities/refreshToken";
import { Request, Response, NextFunction } from "express";
require("dotenv").config();


interface DecodedToken {
    id: string
}

let authToken = async (token: string, secret: string) => {
    try {
        let userId: DecodedToken = jwt.verify(token, secret) as DecodedToken;
        let userRepo = appDataSource.getRepository(User)
        let user = await userRepo.findOne({ where: { id: userId.id } })
        return user;
    }
    catch (err) {
        console.log(err);
        return null
    }
}

let authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try {
        //checking token existance
        let authHeader = req.headers['authorization']
        let token = authHeader?.split(' ')[1] //bearer token, 1 represents token
        if (!token) throw new Error("please login first!")
        //token validation
        let user = await authToken(token!, process.env.ACCESS_TOKEN_SECRET!)
        if (!user) throw new Error("unvalid token, please login and try again")
        //next...
        req.body.user = user
        next()  
    } catch (error) {
        console.log(error)
        res.json({ msg: "unauthorized" })
    }
  }


let refreshMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    let refreshToken = req.cookies.jwt
    try {
        if (!refreshToken) throw new Error("Unauthorized")
        let user = await authToken(refreshToken, process.env.REFRESH_TOKEN_SECRET!)
        let storedToken = await fetchToken(refreshToken)
        if (!user || !storedToken || storedToken.user.id !== user.id) throw new Error("Unvalid token, please login and try again")
        req.body.user = user
        next()
    } catch (error) {
        console.log(error)
        res.json({ msg: "unauthorized, please login" })
    }
}

interface usr {
    id: string,
}


let generateToken = async (user: usr, key: string, ExpDate: string) =>  {
    return jwt.sign(user, key, { expiresIn: ExpDate })
}


let createToken = (token: string, user: User) => {
    let newToken = new RefreshToken()
    newToken.token = token
    newToken.user = user
    return newToken 
}

let deleteToken = async(token: string) => {
    let tokenRepo = appDataSource.getRepository(RefreshToken)
    await tokenRepo.delete({ token: token })
}

let fetchToken = (token: string) => {
    let tokenRepo = appDataSource.getRepository(RefreshToken)
    return tokenRepo.findOne({ relations: {user: true } , where: {token: token} })
}


    


export {
    authToken,
    generateToken,
    createToken,
    authMiddleware,
    deleteToken,
    fetchToken,
    refreshMiddleware
}