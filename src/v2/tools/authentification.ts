import * as express from "express";
import axios from "axios";
import { PermissionError, NotFoundError } from "./ApiError";
import { APIUser } from "discord-api-types";
import { UserService } from "../service/user.service"

const userService = new UserService()

export function expressAuthentication(
  request: express.Request,
  securityName: string,
  scopes?: string[]
): Promise<string> {
  if (securityName === "discord") {
    let token: string;
    if (request.headers && request.headers.discord) {
      token = request.headers.discord as string;
    } else {
      return Promise.reject(new Error("Missing access_token in query"));
    }
    
    // scopes is roles
    if(scopes.length) scopes.push("Developer");

    return axios.get('https://discord.com/api/users/@me', {
      headers: {
        authorization: `Bearer ${token}`
      }
  })
    .then(response => response.data)
    .then((discordUser: APIUser) => userService.getUserById(discordUser.id)) // https://discord.com/developers/docs/resources/user#user-object-user-structure
    .then(user => {
      // we need to resolve here to be sure this is a registered user
      if (scopes.length == 0) return Promise.resolve(user.id)

      // check roles in a conditional loop
      let i = 0
      while (scopes.length >= i) {
        if (user.roles.includes(scopes[i])) return Promise.resolve(user.id) // return prematurely if has correct role
        i++
      }

      // Miam an error
      return Promise.reject(new PermissionError());
    });
  }

  return Promise.reject(new NotFoundError('Invalid security name provided'));
}