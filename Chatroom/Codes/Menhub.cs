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
            var man = OnlineMan.AllMen.Find(m => m.ClientID == this.Current.ClientID);
            if (man != null) {
                OnlineMan.AllMen.Remove(man);
            }
            foreach (var m in this.OtherMen) {
                this.Clients.Client(m.ClientID).onMember(this.Current.Data, false);
            }
            return base.OnDisconnected(stopCalled);
        }

        private void connect() {
            var c = this.Current;
            if (!c.Login()) {
                return;
            }
            if (OnlineMan.AllMen.All(m => m.Id != c.Id)) {
                OnlineMan.AllMen.Add(c);
            }
            foreach (var man in OnlineMan.AllMen) {
                if (!c.Visible(man)) {
                    continue;
                }
                this.Clients.Client(man.ClientID).onMember(c.Data, true);
                this.Clients.Caller.onMembersListting(man.Data);
            }
        }
        private OnlineMan current;
        private OnlineMan Current
        {
            get
            {
                if (current != null) {
                    return current;
                }
                var id = int.Parse(this.Context.QueryString["id"]);
                current = OnlineMan.AllMen.FirstOrDefault(m => m.Id == id);
                if (current != null) {
                    return current;
                }
                var key = this.Context.QueryString["key"];
                current = new OnlineMan(id, key);
                current.ClientID = this.Context.ConnectionId;
                return current;
            }
        }
        public IEnumerable<OnlineMan> OtherMen
        {
            get
            {
                foreach (var man in OnlineMan.AllMen) {
                    if (this.Current.Visible(man)) {
                        yield return man;
                    }
                }
            }
        }
        public void Speak(dynamic message) {
            int id = message.id;
            string words = message.words;
            string reciever = message.reciever;
            string whisper = message.whisper;
            try {
                Speak(id, words, int.Parse(reciever ?? "0"), bool.Parse(whisper ?? "false"));
            } catch {
                throw;
            }
        }
        private void Speak(int id, string words, int recieverId, bool whisper) {
            if (recieverId == 0) {
                toAll(this.OtherMen, 0, words);
            } else {
                toSomeone(words, recieverId, whisper);
            }
            this.Clients.Caller.onSent(id, DateTime.Now);
        }

        private void toSomeone(string words, int recieverId, bool whisper) {
            var reciever = this.OtherMen.FirstOrDefault(m => m.Id == recieverId);
            if (reciever == null) {
                return;
            }
            this.Clients.Client(reciever.ClientID).onMessage(this.Current.Id, words, whisper);
            if (!whisper) {
                this.toAll(this.OtherMen.Where(m => m.Id != recieverId), recieverId, words);
            }
        }

        private void toAll(IEnumerable<OnlineMan> men, int recieverId, string words) {
            var connectionIds = men.Where(m => recieverId == 0 || OnlineMan.InConnection(this.Current.Id, recieverId)).Select(m => m.ClientID).ToList();
            //foreach (var man in men) {
            //    if (!OnlineMan.InConnection(this.Current.Id, recieverId)) {
            //        continue;
            //    }
            //    this.Clients.Client(man.ClientID).onNoise(this.Current.Id, recieverId, words);
            //}
            this.Clients.Clients(connectionIds).onNoise(this.Current.Id, recieverId, words);
        }

        public void Ignore(int id) {
            var basterd = OnlineMan.InConnection(this.Current, id);
            if (basterd == null) {
                return;
            }
            this.Current.Ignore(basterd);
            this.Clients.Caller.onIgnored(id, true);
            this.Clients.Client(basterd.ClientID).onIgnored(this.Current.Id, false);
        }
        public void Pulse() { }
        public void Exit() {
            this.OnDisconnected(true);
        }
    }
}