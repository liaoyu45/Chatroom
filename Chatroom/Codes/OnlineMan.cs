using System.Collections.Generic;

namespace Chatroom {
    public class OnlineMan  {
        public OnlineMan(int id, string key) {
            Key = key;
            Id = id;
        }
        public int Id { get; private set; }
        public string Key { get; private set; }
        public string Basterds { get; set; }
        public string ClientID { get; set; }
        public IEnumerable<OnlineMan> Others { get; set; }

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
    }
}