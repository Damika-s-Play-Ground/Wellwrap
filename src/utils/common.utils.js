exports.getPlaceholderStringForArray = (arr) => {
    if (!Array.isArray(arr)) {
        throw new Error('Invalid input');
    }

    // if is array, we'll clone the arr
    // and fill the new array with placeholders
    const placeholders = [...arr];
    return placeholders.fill('?').join(', ').trim();
}


exports.multipleColumnSet = (object, table = null, operator = null) => {
    if (typeof object !== 'object') {
        throw new Error('Invalid input');
    }

    const keys = Object.keys(object);
    const values = Object.values(object);

    let columnSet;
    if (table) {
        if (operator === 'and') {
            columnSet = keys.map(key => `${table}.${key} = ?`).join(' AND ');
        } else if(operator === 'or') {
            columnSet = keys.map(key => `${table}.${key} = ?`).join(' OR ');
        } else {
            columnSet = keys.map(key => `${table}.${key} = ?`).join(', ');
        }
    } else {
        if (operator === 'and') {
            columnSet = keys.map(key => `${key} = ?`).join(' AND ');
        } else if(operator === 'or') {
            columnSet = keys.map(key => `${key} = ?`).join(' OR ');
        } else {
            columnSet = keys.map(key => `${key} = ?`).join(', ');
        }
    }

    return {
        columnSet,
        values
    }
}