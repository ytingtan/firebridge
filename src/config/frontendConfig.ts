import axios from 'axios'
import EmailPasswordReact from 'supertokens-auth-react/recipe/emailpassword'
import SessionReact from 'supertokens-auth-react/recipe/session'
import { appInfo } from './appInfo'

export const frontendConfig = () => {
  return {
    appInfo,
    recipeList: [
      EmailPasswordReact.init({
        emailVerificationFeature: {
          mode: "REQUIRED"
        },
        signInAndUpFeature: {
          signUpForm: {
            formFields: [{
              id: "name",
              label: "Full name",
              placeholder: "First name and last name",
              validate: async (value: string) => {
                if (/^[-a-zA-Z' ]+$/.test(value)) {
                  return undefined
                } else {
                  return "Invalid name given."
                }
              }
            }, {
              id: "bbo_username",
              label: "BBO username",
              placeholder: "Your BBO username",
              validate: async (value) => {
                let data = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_ENDPOINT!}/auth/checkavailability?bbo_username=${value}`).then(res => res.data)
                if (data['available'] && data['exists']) {
                  return undefined // means that there is no error
                } else if (data['exists']) {
                  return "BBO username in use"
                } else {
                  return "BBO username does not exist"
                }
              }
            }],
            style: {
              superTokensBranding: {
                display: "None"
              },
              container: {
                fontFamily: "sans-serif"
              }
            }
          },
          signInForm: {
            style: {
              superTokensBranding: {
                display: "None"
              },
              container: {
                fontFamily: "sans-serif"
              }
            }
          }
        },
        useShadowDom: false,
        getRedirectionURL: async (context) => {
          if (context.action === "RESET_PASSWORD") {
            // called when the user clicked on the forgot password button
          } else if (context.action === "SIGN_IN_AND_UP") {
            // called when the user is navigating to sign in / up page
          } else if (context.action === "SUCCESS") {
            // called on a successful sign in / up. Where should the user go next?
            let redirectToPath = context.redirectToPath;
            if (redirectToPath !== undefined) {
              // we are navigating back to where the user was before they authenticated
              return redirectToPath;
            }
            if (context.isNewUser) {
              // user signed up
              return "/onboarding"
            } else {
              // user signed in
              return "/"
            }
          } else if (context.action === "VERIFY_EMAIL") {
            // called when the user is to be shown the verify email screen
          }
          // return undefined to let the default behaviour play out
          return undefined;
        }
      }),
      SessionReact.init(),
    ],
  }
}