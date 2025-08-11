
import { useEffect, useState } from "react";
import 'primeicons/primeicons.css';

const ErrorPage = (props: any) => {
   const [statusCode, setStatusCode] = useState()
   const [statusMessage, setStatusMessage] = useState('')
   const [statusPara, setStatusPara] = useState('')
  
   useEffect(() => {
      let code = props?.code;
      
      if (code === "401") {
         
        // redirect(`${process.env.REACT_APP_LOGIN_PATH}`)
         window.location.href=`${process.env.REACT_APP_B2B_LOGIN_REDIRECT_URL}`;
         // setStatusCode(code)
         // setStatusMessage('Try to Access Unauthorize Page')
         // setStatusPara(' Sorry, You are not authorize to access requested page!')
      }
      if (code === "404") {
         setStatusCode(code)
         setStatusMessage('Try to Access Unauthorize Page')
         setStatusPara(' Sorry, You are not authorize to access requested page!')
      }
      else if (code === "403") {
         setStatusCode(code)
         setStatusMessage('Forbidden')
         setStatusPara(' Sorry, Access to this resource on the server is denied!')
      }
      else if (code === "501") {
         setStatusCode(code)
         setStatusMessage('Not Implemented')
         setStatusPara(' Sorry, The Request method is not implemented by the server!')
      }
      else if (code === "502") {
         setStatusCode(code)
         setStatusMessage('Bad Gateway')
      } else if (code === "500") {
         setStatusCode(code)
         setStatusMessage('Network Error')
      } else {
         code = "404"
         setStatusCode(code)
         setStatusMessage('Page Not Found ')
         setStatusPara('We could Not find page  you are looking for')
      }


   }, [props])

   return (
      <section className="w-full">
         <div className="mt-8">
            <center>
               <h1 className="mb-2">
                  {statusCode}
               </h1>
               <h4>
                  {statusMessage}   <i className="pi pi-exclamation-triangle text-amber-500" style={{ fontSize: '2.5rem' }}></i>
               </h4>
               <div className="error-details mb-7 Text_Secondary ">
                  {statusPara}
               </div>
               <a href={`${process.env.REACT_APP_REDIRECT_URL}workorderlist`} className="Primary_Button">Back To Workorder</a>
               {/*       
        <Buttons
         type="button"
         className="Primary_Button"
         label={"Back To Workorder"}
         onClick={()=>
            navigate("/workorderlist")
         }
         /> */}


            </center>
         </div>
      </section>
   )
}

export default ErrorPage