import jwt from 'jsonwebtoken';
import { AppConfig } from '../environment/appconfig';

// interface IFuncGenerateToken {
//   companyId: string;
//   email: string;
//   userId: string;
//   teamId: string;
//   roleCode: string;
//   isAdmin: boolean;
// }

// export const generateToken = ({
//   companyId,
//   email,
//   teamId,
//   userId,
//   roleCode,
//   isAdmin,
// }: IFuncGenerateToken) => {
//   const payload = {
//     companyId,
//     email,
//     teamId,
//     userId,
//     roleCode,
//     isAdmin,
//   };

//   const accessToken = jwt.sign(
//     payload,
//     AppConfig.SECRET_KEY_ACCESS_TOKEN || '',
//     {
//       expiresIn: '3h',
//     },
//   );

//   const refreshToken = jwt.sign(
//     payload,
//     AppConfig.SECRET_KEY_REFRESH_TOKEN || '',
//     {
//       expiresIn: '90d',
//     },
//   );

//   return { accessToken, refreshToken };
// };

export const verifyAccessToken = (accessToken) => {
  try {
    const decode = jwt.verify(
      accessToken.toString(),
      AppConfig.SECRET_KEY_ACCESS_TOKEN || '',
    );
    return { status: 'SUCCESS', data: decode };
  } catch (error) {
    return { status: 'FAIL', message: 'Invalid Token' };
  }
};

// export const verifyRefreshToken = (refreshToken: string) => {
//   const decode = jwt.verify(
//     refreshToken,
//     AppConfig.SECRET_KEY_REFRESH_TOKEN || '',
//   );
//   return decode;
// };
