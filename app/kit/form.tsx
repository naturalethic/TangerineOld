import {
    Form as RemixForm,
    useActionData,
    useFetcher,
    useLocation,
} from "@remix-run/react";
import { capitalize } from "inflection";
import { get as getPath, has as hasPath, set as setPath } from "object-path";
import {
    Children,
    cloneElement,
    FormEvent,
    isValidElement,
    useState,
} from "react";
import { z, ZodError, ZodFormattedError } from "zod";

// interface Form {
//     children: React.ReactNode;
//     className?: string;
//     action?: string;
//     method?: "post" | "patch" | "delete";
//     // schema: z.ZodTypeAny;
//     // values: z.infer<Form["schema"]>;
// }

// export function Form({
//     children,
//     className,
//     action,
//     method = "post",
//     // schema,
//     // values,
// }: Form) {
//     // const fetcher = useFetcher();
//     action ??= useLocation().pathname;
//     const fetcher = useFetcher();
//     // const actionData = useActionData<Form["schema"]>();
//     // console.log("ACTION DATA", actionData);

//     // const onSubmit = async (event: FormEvent) => {
//     //     event.preventDefault();
//     //     let data = JSON.parse(JSON.stringify(values));
//     //     const fields = Array.from(
//     //         event.currentTarget as HTMLFormElement,
//     //     ) as Element[];
//     //     for (const element of fields) {
//     //         switch (element.tagName) {
//     //             case "INPUT": {
//     //                 const field = element as HTMLInputElement;
//     //                 setPath(data, field.name, field.value);
//     //                 break;
//     //             }
//     //         }
//     //     }
//     //     // try {
//     //     //     data = schema.parse(data);
//     //     // } catch (error) {
//     //     //     if (error instanceof ZodError) {
//     //     //         setErrors(error.format());
//     //     //         return;
//     //     //     } else {
//     //     //         throw error;
//     //     //     }
//     //     // }
//     //     // const result = await fetch(action!, {
//     //     //     method,
//     //     //     headers: {
//     //     //         "Content-Type": "application/json",
//     //     //     },
//     //     //     body: JSON.stringify(data),
//     //     // });
//     //     // console.log("RESULT", await result.json());
//     // };

//     // const [errors, setErrors] = useState<ZodFormattedError<any> | null>(null);

//     return (
//         <RemixForm
//             className={className}
//             method={
//                 method
//             }
//             // onSubmit={onSubmit}
//         >
//             {Children.map(children, (child) => {
//                 if (isValidElement(child)) {
//                     switch (child.type) {
//                         case Text: {
//                             return cloneElement(child, {
//                                 ...child.props,
//                                 defaultValue:
//                                     child.props.defaultValue ??
//                                     getPath(
//                                         fetcher.data ?? values,
//                                         child.props.name,
//                                     ),
//                                 // errors:
//                                 //     errors &&
//                                 //     hasPath(errors, child.props.name) &&
//                                 //     getPath(errors, child.props.name)._errors,
//                             });
//                         }
//                     }
//                 }
//                 return child;
//             })}
//         </RemixForm>
//     );
// }

interface Text {
    name: string;
    value?: string;
    defaultValue?: string;
    label?: string;
    errors?: string[];
}

export function Text({ name, value, defaultValue, label, errors }: Text) {
    label ??= capitalize(name.split(".").pop()!);
    return (
        <label className="flex flex-col">
            <div className="pl-2 text-zinc-400 flex flex-row items-center">
                <div>{label}</div>
            </div>
            <input
                type="text"
                name={name}
                value={value}
                defaultValue={defaultValue}
            />
            {errors && (
                <div role="alert" className="mt-1 pl-2">
                    {errors.map((error, i) => (
                        <div key={i}>{error}</div>
                    ))}
                </div>
            )}
        </label>
    );
}

interface Hidden {
    name: string;
    value?: string;
}

export function Hidden({ name, value }: Hidden) {
    return <input type="hidden" name={name} value={value} />;
}

interface Action {
    className?: string;
    value?: string;
    label?: string;
}

export function Action({ className, value = "submit", label }: Action) {
    label ??= capitalize(value);
    className ??=
        "bg-zinc-800 text-zinc-400 rounded px-2 py-1 border border-zinc-500";
    return (
        <button className={className} name="action" value={value}>
            {label}
        </button>
    );
}

interface Select {
    children: React.ReactNode;
    name: string;
    label?: string;
    defaultValue?: string;
}

export function Select({ children, name, label, defaultValue }: Select) {
    label ??= capitalize(name.split(".").pop()!);
    return (
        <label className="flex flex-col">
            <div className="pl-2 text-zinc-400 flex flex-row items-center">
                <div>{label}</div>
            </div>
            <select name={name} defaultValue={defaultValue}>
                {children}
            </select>
        </label>
    );
}

// import { FormMethod, useFetcher } from "@remix-run/react";
// import { capitalize } from "inflection";
// import { MdAddCircle } from "react-icons/md";
// import {
//     useField,
//     useIsValid,
//     ValidatedForm,
//     Validator,
// } from "remix-validated-form";

// interface FormProps {
//     children: React.ReactNode;
//     action: string;
//     validator: Validator<any>;
//     method: FormMethod;
// }

// export function Form({ children, action, validator, method }: FormProps) {
//     const fetcher = useFetcher();
//     const valid = useIsValid("fooform");
//     // const form = useRef<HTMLFormElement>(null);

//     // const onSubmit = function (event: React.FormEvent<HTMLFormElement>) {
//     // 	event.preventDefault();
//     // 	fetcher.submit(form.current);
//     // };
//     console.log("FORM");
//     console.log(valid);
//     return (
//         <ValidatedForm
//             id="fooform"
//             className="flex flex-col space-y-4"
//             // onSubmit={onSubmit}
//             action={action}
//             method={method}
//             fetcher={fetcher}
//             // ref={form}
//             validator={validator}
//             onSubmit={async (data) => {
//                 console.log(data);
//             }}
//         >
//             {children}
//             <input type="submit" value="Submit2" />
//             VALID [{valid}]
//         </ValidatedForm>
//     );
// }

// interface LabelProps {
//     children?: React.ReactNode;
//     label: string;
//     onAdd?: () => void;
// }

// export function Label({ children, label, onAdd }: LabelProps) {
//     return (
//         <label>
//             <div className="px-2 pb-1 text-zinc-400 flex flex-row items-center space-x-1">
//                 <div>{capitalize(label)}</div>
//                 {onAdd && (
//                     <MdAddCircle className="cursor-pointer" onClick={onAdd} />
//                 )}
//             </div>
//             {children}
//         </label>
//     );
// }

// interface TextProps {
//     name: string;
//     defaultValue: string;
//     border?: boolean;
//     ring?: boolean;
//     disabled?: boolean;
// }

// export function Text({
//     name,
//     defaultValue,
//     border = true,
//     ring = true,
//     disabled = false,
// }: TextProps) {
//     const { error, getInputProps } = useField(name);
//     let className =
//         "bg-zinc-800 text-zinc-400 rounded px-2 py-1 border-zinc-500 w-full ring-0 outline-0";
//     if (border) {
//         className += " border";
//     }
//     if (ring) {
//         className += " focus:ring-1 focus:ring-zinc-400";
//     }
//     console.log(error);
//     return (
//         <div>
//             <input
//                 {...getInputProps({
//                     className: className,
//                     disabled,
//                     defaultValue,
//                 })}
//                 // className={className}
//                 // type="text"
//                 // name={name}
//                 // defaultValue={
//                 // 	defaultValue
//                 // }
//                 // disabled={disabled}
//             />
//             {error && <span className="my-error-class">{error}</span>}
//         </div>
//     );
// }

// interface HiddenProps {
//     name: string;
//     value: string;
// }

// export function Hidden({ name, value }: HiddenProps) {
//     return <input type="hidden" name={name} value={value} />;
// }

// interface SubmitProps {
//     label?: string;
// }

// export function Submit({ label = "Submit" }: SubmitProps) {
//     return (
//         <button className="bg-zinc-800 text-zinc-400 rounded px-2 py-1 border border-zinc-500">
//             {label}
//         </button>
//     );
// }
