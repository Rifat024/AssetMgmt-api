import { apiError } from '../http-helpers/api-response';
import { getTimeStampSecond } from '../utils/commonUtils';
import { verifyAccessToken } from '../utils/jwt';

export const authenticator = () => {
  return {
    before: async (request) => {
      try {
        console.log('authenticator HERE !!!', JSON.stringify(request?.event));
        if (!request?.event?.headers?.accesstoken) {
          throw new Error('UNAUTHORIZED');
        }
        const decode = verifyAccessToken(request.event.headers.accesstoken);
        if (decode.status === 'FAIL') {
          throw new Error(decode.message);
        }
        console.log('##############->', JSON.stringify(decode));
        if (decode.exp < getTimeStampSecond()) {
          throw new Error('Token is expired');
        }
        request.event.requestToken = { ...decode.data };
      } catch (error) {
        throw new Error(error.message || 'Invalid Token');
      }
    },
  };
};

// export const authorizer = ({ screenCode = '', actionCode = '' }) => {
//   return {
//     before: async (request) => {
//       try {
//         console.log('123213123', JSON.stringify({ screenCode, actionCode }));
//         const authData = request.event.requestToken;
//         console.log('authData36' + JSON.stringify(authData));
//         if (!authData.isAdmin) {
//           const roleCodeRes = await getAuthRoleByRoleCore(authData);
//           if (!roleCodeRes.body.Items.length) {
//             throw new Error('FORBIDDEN');
//           }
//           const roleCodeData = roleCodeRes.body.Items[0];

//           const screenIndex = roleCodeData.permissionList.findIndex(
//             (item) => item?.screenCode === screenCode,
//           );
//           console.log({ screenIndex });
//           if (screenIndex === -1) {
//             throw new Error('FORBIDDEN');
//           }

//           const actionIndex = roleCodeData.permissionList[
//             screenIndex
//           ].actionList.findIndex((item) => item?.actionCode === actionCode);

//           console.log({ actionIndex });

//           if (actionIndex === -1) {
//             throw new Error('FORBIDDEN');
//           }
//         }
//       } catch (error) {
//         throw new Error(error.message || 'INTERNAL_SERVER_ERROR');
//       }
//     },
//   };
// };

export const handleErrorMiddleware = () => {
  return {
    onError: async (handler, next) => {
      const { error } = handler;

      handler.response = apiError(401, {
        message: error.message || 'INTERNAL_SERVER_ERROR',
      });

      return next();
    },
  };
};
