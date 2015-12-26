using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;

namespace Chatroom {
    [Table("Men")]
    public partial class Man : ContextBoundObject {
        [Key]
        public int Id { get; set; }
        [Required]
        public string Email { get; set; }
        [Required]
        public string Password { get; set; }
        public string Basterds { get; set; }
        public DateTime? Birthday { get; set; }
        public int? Height { get; set; }
        public int? Weight { get; set; }
        public string Charactor { get; set; }
        public DateTime RegisterTime { get; set; }
        public DateTime ActiveTime { get; set; }
        public string Nickname { get; set; }
        public string Contacts { get; set; }
        public string Introduce { get; set; }
        public string Taste { get; set; }
        public string Filter { get; set; }

        public string AHWC {
            get {
                return string.Format("{0}-{1}-{2}-{3}", (DateTime.Now - (this.Birthday ?? DateTime.Now)).Days / 365, this.Height ?? 0, this.Weight ?? 0, this.Charactor ?? string.Empty);
            }
        }
        public string Name {
            get { return this.Nickname ?? this.Email.Split('@')[0]; }
        }
        public string Photo { get {
            return "" + 1;
        } }
        public bool Ignore(int basterd) {
            if ((this.Basterds ?? string.Empty).Split(',').Contains(basterd.ToString())) {
                return false;
            }
            this.Basterds += "," + basterd;
            return true;
        }
        public bool Check(string password) {
            return MD5.Encrypt(password) == this.Password;
        }
        public static Man SameToLY(string email, string password) {
            return new Man {
                Email = email,
                Password = MD5.Encrypt(password),
                RegisterTime = DateTime.Now,
                ActiveTime = DateTime.Now,
                Birthday = new DateTime(1990, 03, 13),
                Weight = 50,
                Height = 174,
                Charactor = "~",
            };
        }
    }
}