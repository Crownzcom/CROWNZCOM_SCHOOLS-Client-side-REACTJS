import {
    databases,
    database_id,
    couponUsagesTable_id
} from "../appwriteConfig.js";
import moment from 'moment';
import { serverUrl } from "../config.js";

export const updateLabels = async (userId, labels) => {
    const paylaod = {
        userId: userId,
        labels: labels,
    };
    // Send the information to the backend
    fetch(`${serverUrl}/update-labels`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(paylaod),
    })
        .then(response => {
            return response.json();
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

/**
* Formats the date string into a more readable format.
* @param {string} dateTime - The original date-time string.
* @returns {string} - The formatted date-time string.
*/
export const formatDate = (dateTime) => {
    const date = new Date(dateTime);
    return `${date.toLocaleString("en-US", {
        dateStyle: "long",
    })} ${date.toLocaleTimeString()}`;
};

/**
* APPWRITE FUNCTIONS
*/

/*** ----------- Create a document ----------- ***/
export const createDocument = async (databaseId, tableId, data, tableUse) => {
    try {
        const response = await databases.createDocument(databaseId, tableId, 'unique()', data)
        return response;
    } catch (error) {
        console.error(`Error Creating Document - (${tableUse}):`, error);
        return null;
    }
}

/* ----------- Coupon Usage tracking ----------- ***/
export const couponTrackerUpdate = async (data) => {
    try {
        var currentDateTime = moment().format('MMMM Do YYYY, h:mm:ss a z');
        await createDocument(database_id, couponUsagesTable_id, {
            schoolID: data.schoolId,
            CouponCode: data.couponCode,
            UsageDate: currentDateTime,
        }, data.message)
    } catch (e) {
        console.error('Failed to update coupon usage table: ', e);
    }
}

//Capitalize first letter in a string
export const capitalizeFirstLetter = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

//capitalize first leeter of a word in a sentence
export const capitalizeFirstLetterSentence = (str) => {
    const sentences = str.split('. '); // Split the string into sentences  
    const capitalizedSentences = sentences.map(sentence => {
        if (sentence.length > 0) {
            return sentence.charAt(0).toUpperCase() + sentence.slice(1);
        } else {
            return sentence;
        }
    });
    return capitalizedSentences.join('. '); // Join the sentences back together
}

//Capitalize every first letter of a word in a sentence
export const capitalizeEveryFirstLetter = (str) => {
    const words = str.split(' ');
    const capitalizedWords = words.map(word => {
        if (word.length > 0) {
            return word.charAt(0).toUpperCase() + word.slice(1);
        } else {
            return word;
        }
    });
    return capitalizedWords.join(' ');
}