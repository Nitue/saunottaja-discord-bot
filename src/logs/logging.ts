
function info(...data: any[]) {
    console.log(getISODate(), ...data);
}

function warning(...data: any[]) {
    console.warn(getISODate(), ...data);
}

function error(...data: any[]) {
    console.error(getISODate(), ...data);
}

function getISODate() {
    return new Date().toISOString();
}

export const log = {
    info,
    warning,
    error
}