import NotificationService from './NotificationService';
import appConfig from './app.json';

export default class NotificationHelper{
    constructor() {
        this.state = {
            senderId: appConfig.senderId
        };
    
        this.notif = new NotificationService(this.onRegister.bind(this), this.onNotif.bind(this));
    }

    onRegister(token) {
        Alert.alert("Registered !", JSON.stringify(token));
        console.log(token);
        this.setState({ registerToken: token.token, gcmRegistered: true });
    }
    
    onNotif(notif) {
        console.log(notif);
        Alert.alert(notif.title, notif.message);
    }
}