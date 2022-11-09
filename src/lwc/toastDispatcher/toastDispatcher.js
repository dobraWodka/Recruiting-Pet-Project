/**
 * Created by yurii.bubis on 11/9/2022.
 */

import {ShowToastEvent} from "lightning/platformShowToastEvent";

const dispatchToast = (title, message, variant, messageData) =>  {
    dispatchEvent( new ShowToastEvent ({
        title: title ?? "" ,
        message: message ?? "Unknown Error",
        variant: variant ?? "error",
        messageData: messageData ?? ""
    }));
    }
export {dispatchToast}
