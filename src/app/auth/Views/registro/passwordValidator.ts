import { ValidationErrors, FormGroup, ValidatorFn } from "@angular/forms";

// ValidatorFn que recibe un FormGroup y devuelve ValidationErrors | null
export const passwordValidator: ValidatorFn = (control: FormGroup): ValidationErrors | null => {
    const clave = control.get("clave").value;
    const claveR = control.get("claveR").value;
    return clave && claveR && clave === claveR
        ? null
        : { passwordsNotEqual: true };
};
