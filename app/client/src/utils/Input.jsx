import { useForm, useFormContext } from "react-hook-form"
import { findInputError, isFormInvalid } from "./utils.jsx";
import { useEffect, useRef, useState } from "react";
export const Input = ({ label, type, id, placeholder = "input data here", value, validationMessage, min, max, maxLenght, minLenght, isRequired = true, readonly = false }) => {
    const {
        register,
        formState: { errors },
      } = useFormContext();

      const inputError = findInputError(errors, label); //pass the form errors and the label of the input to find the error
      const isInvalid = isFormInvalid(inputError); //returns true if the input is invalid
    return (
        <div id={"div"+id}>
            <label htmlFor={id} id={"label"+id} className="font-semibold capitalize " >
                {label}
            </label>

            {isInvalid && (<ErrorDisplayer
                message={inputError.error.message}
            />)}
            <input id={id}
            type={type}
            //className="w-full p-5 font-medium border rounded-md border-slate-300 placeholder:opacity-60"
           //i had to adopt this solution because the input value was not being updated

            placeholder={placeholder}

            readOnly={readonly}

            {...register(label, {
                required : {
                    value : isRequired,
                    message: validationMessage,
                },
                max : {
                    value : max,
                    message : "insert a value lower than " + max,
                },
                min : {
                    value : min,
                    message : "insert a value higher than " + min,
                },
                maxLength : {
                    value : maxLenght,
                    message : "insert a value with at most" + maxLenght + " characters",
                },
                minLength : {
                    value : minLenght,
                    message : "insert a value with at least" + minLenght + " characters",
                },
            })}
            />
        </div>   
    )
}


export const ErrorDisplayer = ( {message} ) =>{

    return (
        <div className="text-red-500 text-sm">
            {message}
        </div>
    )
}