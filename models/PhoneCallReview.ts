import BaseModel            = require('./BaseModel');
import Utils                = require('../common/Utils');

class PhoneCallReviewModel extends BaseModel
{
    static TABLE_NAME:string = 'phone_call_review';

    static COL_CALL_ID:string                               = 'call_id';
    static COL_USER_ID:string                               = 'user_id';
    static COL_REVIEW:string                                = 'review';
    static COL_COMMENT:string                               = 'comment';

    private call_id:number;
    private user_id:number;
    private review:number;
    private comment:string;

    static PUBLIC_FIELDS:string[] = [PhoneCallReviewModel.COL_CALL_ID,PhoneCallReviewModel.COL_ID,PhoneCallReviewModel.COL_USER_ID,PhoneCallReviewModel.COL_REVIEW,PhoneCallReviewModel.COL_COMMENT];

    /* Getters */
    getCallId():number                  { return this.call_id; }
    getUserId():number                  { return this.user_id; }
    getReview():number                  { return this.review; }
    getComment():string                 { return this.comment; }

    /* Setters */
    setCallId(val:number):void          { this.call_id = val; }
    setUserId(val:number):void          { this.user_id = val; }
    setReview(val:number):void          { this.review = val; }
    setComment(val:string):void         { this.comment = val; }

    isValid():boolean
    {
        return (!Utils.isNullOrEmpty(this.getCallId()) && !Utils.isNullOrEmpty(this.getUserId()));
    }
}
export = PhoneCallReviewModel