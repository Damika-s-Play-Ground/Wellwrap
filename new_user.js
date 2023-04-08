const UserModel = require('./src/models/user.model');

module.exports.handler = async (event, context) => {

    try {
        if (event.request.userAttributes.email && event.request.userAttributes.email_verified) {
            let username = event.userName;
            let email = event.request.userAttributes.email;

            let user = await UserModel.findOne({username: username});
            if (Object.keys(user).length === 0) {
                await UserModel.create({username, email});
            }

        }
    } catch (error) {
        console.log(error);
    }
    context.done(null, event);
};