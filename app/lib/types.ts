export interface Identified {
    id: string;
}

export interface Configuration extends Identified {
    authenticationCollection: string;
    authenticationUsernameField: string;
    authenticationPasswordField: string;
}

export interface Session extends Identified {
    queries: string[];
}

export interface BaseField {
    name: string;
    type: string;
}

export interface CheckboxField extends BaseField {
    type: "checkbox";
}

export interface TextField extends BaseField {
    type: "text";
}

export interface RadioField extends BaseField {
    type: "radio";
    values: string[];
}

export interface DateField extends BaseField {
    type: "date";
}

export interface TimeField extends BaseField {
    type: "time";
}

export interface DateTimeField extends BaseField {
    type: "datetime";
}

export type Field =
    | CheckboxField
    | TextField
    | RadioField
    | DateField
    | TimeField
    | DateTimeField;

export const fields = ["checkbox", "text", "radio", "date", "time", "datetime"];
