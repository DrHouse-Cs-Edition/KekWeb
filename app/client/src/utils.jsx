export function findInputError ( errors, name ){
    const filtered = Object.keys(errors)    // ritorna le chiavi dell'oggetto errors
    .filter(key => key.includes(name))      // filters the keys to only include those that contain the name
    .reduce((cur, key)=>{                   // reduce makes the filtered keys into a single object
        return Object.assign(cur, {error: errors[key] })    //add an error field to the object, with the value of the error filtered
        }, {})
        return filtered;
}

export const isFormInvalid = err =>{
    if(Object.keys(err).length > 0 ) return true
    return false
}