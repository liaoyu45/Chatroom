using Microsoft.AspNet.SignalR;
using Microsoft.AspNet.SignalR.Hubs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Chatroom {
    [HubName("menhub")]
    public class Menhub : Hub {
        public override Task OnConnected() {
            connect();
            return base.OnConnected();
        }
        public override Task OnReconnected() {
            connect();
            return base.OnReconnected();
        }
        public override Task OnDisconnected(bool stopCalled) {
            Current.Leave();
            foreach (var m in Current.Others) {
                Clients.Client(m.ClientID).onMember(Current.Id, false);
            }
            return base.OnDisconnected(stopCalled);
        }

        private void connect() {
            Current.CheckLogin();
            Clients.Caller.onTotal(Current.Others.Count());
            foreach (var man in Current.Others) {
                Clients.Client(man.ClientID).onMember(Current.Id, true);
                Clients.Caller.onMembersListting(man.Id);
            }
        }
        private OnlineMan current;
        private Msg Msg;

        private OnlineMan Current {
            get {
                if (current != null) {
                    return current;
                }
                var id = int.Parse(Context.QueryString["id"]);
                current = LY.Someone(id);
                if (current != null) {
                    return current;
                }
                var key = Context.QueryString["key"];
                current = new OnlineMan(id, key);
                current.ClientID = Context.ConnectionId;
                return current;
            }
        }
        public void Speak(dynamic message) {
            integrateMSG(message);
            if (Msg.Reciever == 0) {
                toAll();
                onSent();
                return;
            }
            if (Current.InSight(Msg.Reciever)) {
                toSomeone();
                onSent();
                return;
            }
            onNotSent(message);
        }

        private void onNotSent(dynamic message) {
            Clients.Caller.onNotSent(message, DateTime.Now);
        }

        private void onSent() {
            Clients.Caller.onSent(Msg.Id, DateTime.Now);
        }

        private void integrateMSG(dynamic message) {
            int i;
            int.TryParse((string)message.id, out i);
            int r;
            int.TryParse((string)message.reciever, out r);
            bool w;
            bool.TryParse((string)message.whisper, out w);
            Msg = new Msg() {
                Id = i,
                Words = message.words,
                Reciever = r,
                Whisper = w
            };
        }

        private void toSomeone() {
            var reciever = Current.Someone(Msg.Reciever);
            Clients.Client(reciever.ClientID).onMessage(Current.Id, Msg.Words, Msg.Whisper);
            if (!Msg.Whisper) {
                toAll();
            }
        }

        private void toAll() {
            var connectionIds = Current.Others.Select(m => m.ClientID).ToList();
            connectionIds.Remove(Current.Someone(Msg.Reciever)?.ClientID);
            Clients.Clients(connectionIds).onNoise(Current.Id, Msg.Reciever, Msg.Words);
        }

        public void Ignore(int id) {
            var basterd = Current.InConnection(id);
            if (basterd == null) {
                return;
            }
            Current.Ignore(basterd);
            Clients.Caller.onIgnored(id, true);
            Clients.Client(basterd.ClientID).onIgnored(Current.Id, false);
        }
        public void Pulse() { }
        public void Exit() {
            OnDisconnected(true);
        }
    }
}