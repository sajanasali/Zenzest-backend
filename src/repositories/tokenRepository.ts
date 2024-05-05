import usertoken from "../model/userToken";
import { Usertoken } from "../interfaces/token";

class tokenRepository {
  async storeToken(details: Usertoken) {
    try {
      console.log("inside the token repository");
      const tokenDetails = await usertoken.create(details);
      console.log(tokenDetails, "otdokj");
      if (!tokenDetails) {
        return {
          success: false,
          message: "token not stored",
        };
      }
      return {
        success: true,
        message: "Token stored",
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message,
      };
    }
  }
}
export default tokenRepository;
