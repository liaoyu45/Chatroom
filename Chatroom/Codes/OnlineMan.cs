using System;
using System.Collections.Generic;
using System.Linq;

namespace Chatroom {
    public partial class OnlineMan {
        public OnlineMan(int id, string key) {
            this.Key = key;
            this.Id = id;
        }
        public int Id { get; private set; }
        public string Key { get; set; }
        public bool Login() {
            using (var f = new LoveFactory()) {
                var man = f.Men.Find(this.Id);
                if (man == null) {
                    return false;//TODO: record it.
                }
                if (((int)(man.ActiveTime - man.RegisterTime).TotalMilliseconds).ToString() != Key) {
                    return false;//TODO: record it.
                }
                this.Data = new ClientData {
                    id = man.Id,
                    ahwc = man.AHWC,
                    name = man.Name,
                    basterds = man.Basterds ?? string.Empty
                };
                return true;
            }
        }
        public bool Visible(OnlineMan him) {
            if (this.Id == him.Id) {
                return false;
            }
            if (this.Data.basterds.Split(',').Contains(him.Id.ToString())) {
                return false;
            }
            if (him.Data.basterds.Split(',').Contains(this.Id.ToString())) {
                this.Data.basterds += "," + him.Id;
                return false;
            }
            return true;
        }
        public ClientData Data { get; private set; }
        public void Ignore(OnlineMan basterd) {
            this.Data.basterds += "," + basterd.Id;
            basterd.Data.basterds += "," + this.Id;
        }
        public string ClientID { get; set; }
        public override bool Equals(object obj) {
            if (obj == null || this.GetType() != obj.GetType()) {
                return false;
            }
            var ano = obj as OnlineMan;
            return this.Id == ano.Id;
        }
        public override int GetHashCode() {
            return this.Id;
        }
        public static List<OnlineMan> AllMen = new List<OnlineMan>();
        public static bool InConnection(int meId, int himId) {
            if (meId == 0 || himId == 0) {
                return false;
            }
            var me = AllMen.FirstOrDefault(m => m.Id == meId);
            if (me == null) {
                return false;
            }
            var him = AllMen.FirstOrDefault(m => m.Id == himId);
            if (him == null) {
                return false;
            }
            if (me == him) {
                return false;
            }
            var result = me.Visible(him);
            return result;
        }
        public static OnlineMan InConnection(OnlineMan me, int himId) {
            if (me == null || himId ==0) {
                return null;
            }
            if (me.Id == himId) {
                return null;
            }
            var him = AllMen.FirstOrDefault(m => m.Id == himId);
            if (him == null) {
                return null;
            }
            var yes = me.Visible(him);
            return yes ? him : null;
        }
    }
}