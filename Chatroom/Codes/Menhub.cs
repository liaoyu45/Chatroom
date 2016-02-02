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
            LY.Leave(this.Current);
            foreach (var m in Current.Others) {
                this.Clients.Client(m.ClientID).onMember(this.Current.Id, false);
            }
            return base.OnDisconnected(stopCalled);
        }

        private void connect() {
            LY.CheckLogin(this.Current);
            foreach (var man in this.Current.Others) {
                this.Clients.Client(man.ClientID).onMember(Current.Id, true);
                this.Clients.Caller.onMembersListting(man.Id);
            }
        }
        private OnlineMan current;
        private Msg Msg;

        private OnlineMan Current {
            get {
                if (current != null) {
                    return current;
                }
                var id = int.Parse(this.Context.QueryString["id"]);
                current = LY.AllMen.FirstOrDefault(m => m.Id == id);
                if (current != null) {
                    return current;
                }
                var key = this.Context.QueryString["key"];
                current = new OnlineMan(id, key);
                current.ClientID = this.Context.ConnectionId;
                return current;
            }
        }
        public void Speak(dynamic message) {
            this.Msg = new Msg() {
                Id = message.id,
                Words = message.words,
                Reciever = Math.Max(int.Parse(message.reciever ?? "0"), 0),
                Whisper = bool.Parse(message.whisper ?? "false")
            };
            if (this.Msg.Reciever == 0) {
                toAll();
            } else if (Current.InSight(this.Msg.Reciever)) {
                toSomeone();
            } else {
                this.Clients.Caller.onNotSent(this.Msg.Id);
                return;
            }
            this.Clients.Caller.onSent(this.Msg.Id, DateTime.Now);
        }        
        private void toSomeone() {
            var reciever = this.Current.Someone(this.Msg.Reciever);
            this.Clients.Client(reciever.ClientID).onMessage(this.Current.Id, this.Msg.Words, this.Msg.Whisper);
            if (!this.Msg.Whisper) {
                this.toAll();
            }
        }

        private void toAll() {
            var connectionIds = this.Current.Others.Select(m => m.ClientID).ToList();
            this.Clients.Clients(connectionIds).onNoise(this.Current.Id, this.Msg.Reciever, this.Msg.Words);
        }

        public void Ignore(int id) {
            var basterd = LY.InConnection(this.Current, id);
            if (basterd == null) {
                return;
            }
            LY.Ignore(Current, basterd);
            this.Clients.Caller.onIgnored(id, true);
            this.Clients.Client(basterd.ClientID).onIgnored(this.Current.Id, false);
        }
        public void Pulse() { }
        public void Exit() {
            this.OnDisconnected(true);
        }
    }
}