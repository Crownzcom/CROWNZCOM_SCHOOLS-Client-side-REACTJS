import axios from 'axios';
import moment from 'moment';
import {
    databases,
    database_id,
    transactionTable_id,
    subscriptionCodeTable_id,
    Query
} from "../../appwriteConfig.js";
import { serverUrl } from "../../config";

export const generateSubscriptionCode = async (txData) => {
    //txn_id, txnRef, noOfStuds, expiryDate, schoolID

    try {
        const response = await axios.post(`${serverUrl}/subscription/generate-code`, txData);

        if (response.status === 200) {
            // Handle successful response
            console.log('Subscription code generated successfully: ', response.data);
            return response.data
        } else {
            // Handle error response
            console.error('Error generating subscription code: ', response.data);
        }
    } catch (error) {
        // Handle errors during the request
        console.error('Error making request to generate subscription code: ', error);
    }
}

/**
 * Save Transaction Details and Subscription Code.
 * @param {object} data - Transaction Data.
 * @returns {string} - Returns the subscription code.
 * @NOTE : Works well with only the Flutterwave transaction response. Adjustments will be required for other transaction gateway implementations
 */
export const saveTransactionData = async (data) => {
    try {
        /*
        -----------
       CHECK WHETHER THE TRANSACTION IS ALREADY SAVED IN THE DATABASE
        -----------
        */
        const existingTransaction = await databases.listDocuments(database_id, transactionTable_id,
            [
                Query.equal('txnID', [`${data.id}`]),
                Query.equal('txnRef', [data.tx_ref])
            ]
        );

        /*
        -----------
        IF TRANSACTION EXISTS, EXIT IMMEDIATELY AND RETURN SUBSCRIPTION CODE, ELSE PROCEED -----------
        */
        if (existingTransaction.documents.length > 0) {
            const couponCode = await databases.listDocuments(database_id, subscriptionCodeTable_id,
                [
                    Query.equal('txnID', [`${data.id}`]),
                    Query.equal('txnRef', [data.tx_ref])
                ]
            );
            return couponCode.documents[0].subCode;
        }

        /*
        -----------
        PROCEEDING WITH SAVING THE TRANSACTION DETAILS/DATA 
        -----------
        */
        try {

            // const created_at_formattedDate = moment(data.created_at, 'DD/MM/YYYY, HH:mm:ss').toDate();

            const response = await databases.createDocument(
                database_id,
                transactionTable_id,
                "unique()",
                {
                    schoolID: data.meta.schoolId,
                    txnDate: new Date(data.created_at),
                    txnAmount: data.amount,
                    txnCurrency: data.currency,
                    paymentMethod: data.payment_type,
                    paymentGateway: 'Flutterwave Gateway',
                    txnStatus: data.status === 'successful' ? 'success' : 'failed',
                    txnRef: data.tx_ref,
                    txnID: `${data.id}`,
                    paymentFor: data.meta.service,
                    description: data.meta.description,
                }
            )

        } catch (e) {
            console.error('Update Transaction table Error: ', e);
        }

        /*
        ----------- 
        Generate sub-code, and then update sub-code tables 
        -----------
        */
        if (data.status === 'successful') {
            // {txn_id, txnRef, noOfStuds, expiryDate, schoolID}
            const txData = {
                txn_id: `${data.id}`,
                txnRef: data.tx_ref,
                noOfStuds: parseInt(data.meta.numberOfStudents, 10),
                expiryDate: data.meta.expiryDate ?? null,
                schoolID: data.meta.schoolId
            }

            /*
            -----------
            Generate the subscription code
            -----------
            */
            const subCode = await generateSubscriptionCode(txData)

            return subCode.code
        }

    } catch (error) {
        console.error('Error saving transaction data:', error);
    }
};