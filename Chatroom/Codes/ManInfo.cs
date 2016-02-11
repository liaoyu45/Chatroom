using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace Chatroom {
    [Table("ManInfos")]
    public class ManInfo : Man {
        public DateTime? Birthday { get; set; }
        public int? Height { get; set; }
        public int? Weight { get; set; }
        public string Charactor { get; set; }

        public string Nickname { get; set; }

        public string Contacts { get; set; }
        public string Introduce { get; set; }
        public string Taste { get; set; }
        public string Filter { get; set; }

        public string BodyType { get; set; }
        public string TargetBodyType { get; set; }

        public string TargetAgeRange { get; set; }

        public string AHWC {
            get {
                return string.Format("{0}-{1}-{2}-{3}", (DateTime.Now - (this.Birthday ?? DateTime.Now)).Days / 365, this.Height ?? 0, this.Weight ?? 0, this.Charactor ?? string.Empty);
            }
        }
        public string Name {
            get { return this.Nickname ?? this.Email.Split('@')[0]; }
        }
    }
}