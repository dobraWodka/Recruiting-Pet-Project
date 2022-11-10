/**
 * Created by yurii.bubis on 11/3/2022.
 */

import {LightningElement, wire, api} from 'lwc';
import setImageUrl from '@salesforce/apex/ImageDisplayHelper.setImageUrl';
export default class ImageDisplayer extends LightningElement {
    @api recordId;
    image;
    connectedCallback() {
        setImageUrl({recordId: this.recordId})
            .then(image => {
                this.image = image
                console.log(image);
            })
            .catch(error => {
                console.log(error)
            });
    }
}