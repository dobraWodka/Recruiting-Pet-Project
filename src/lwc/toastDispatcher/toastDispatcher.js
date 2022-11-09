/**
 * Created by yurii.bubis on 11/9/2022.
 */

import {ShowToastEvent} from "lightning/platformShowToastEvent";

const dispatchToast =  () =>  {
    console.log("inside dispatchToast");
        // this.dispatchEvent( new ShowToastEvent({
        //     title: title,
        //     message: message,
        //     variant: variant
        // }));
    this.dispatchEvent( new ShowToastEvent ({
        title: "Upload your photo",
        message: "To submit your application you need to provide your photo",
        variant: "warning"
    }));
    }
export {dispatchToast}
