using Microsoft.AspNet.SignalR.Hubs;
using System;
using System.Collections.Generic;
using System.Linq;

namespace Chatroom {
    static class LY {
        internal static List<OnlineMan> AllMen = new List<OnlineMan>();
        internal static ManInfo SameToMe(string email, string password) {
            return new ManInfo {
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

        internal static void Leave(this OnlineMan current) {
            var man = LY.AllMen.Find(m => m.ClientID == current.ClientID);
            if (man != null) {
                LY.AllMen.Remove(man);
            }
        }
        internal static bool CheckBasterds(this OnlineMan a, OnlineMan b) {
            if (a.Id == b.Id) {
                return false;
            }
            if (a.Basterds.Split(',').Contains(b.Id.ToString())) {
                return false;
            }
            if (b.Basterds.Split(',').Contains(a.Id.ToString())) {
                a.Basterds += "," + b.Id;
                return false;
            }
            return true;
        }
        internal static void Ignore(this OnlineMan a, OnlineMan b) {
            a.Basterds += "," + b.Id;
            b.Basterds += "," + a.Id;
        }
        internal static void CheckLogin(this OnlineMan om) {
            using (var f = new LoveFactory()) {
                var man = f.Men.Find(om.Id);
                if (man == null) {
                    throw new NotAuthorizedException();
                }
                if (((int)(man.ActiveTime - man.RegisterTime).TotalMilliseconds).ToString() != om.Key) {
                    throw new NotAuthorizedException();
                }
                om.Others = LY.AllMen.Where(m => LY.CheckBasterds(m, om));
                om.Basterds = man.Basterds ?? String.Empty;
                if (LY.AllMen.All(m => m.Id != om.Id)) {
                    LY.AllMen.Add(om);
                }
            }
        }
        internal static bool InSight(this OnlineMan man, int id) {
            return man.Others.Any(m => m.Id == id);
        }
        internal static OnlineMan Someone(int id) {
            return LY.AllMen.FirstOrDefault(m => m.Id == id);
        }
        internal static OnlineMan Someone(this OnlineMan man, int id) {
            return man.Others.FirstOrDefault(m => m.Id == id);
        }
        internal static IEnumerable<OnlineMan> OthersBut(this OnlineMan man, int id) {
            if (id < 1 || man.Others.All(m => m.Id != id)) {
                return man.Others;
            }
            return man.Others.Where(m => m.Id != id);
        }
        internal static OnlineMan InConnection(this OnlineMan me, int himId) {
            if (me == null || himId == 0) {
                return null;
            }
            if (me.Id == himId) {
                return null;
            }
            var him = AllMen.FirstOrDefault(m => m.Id == himId);
            if (him == null) {
                return null;
            }
            var yes = LY.CheckBasterds(me, him);
            return yes ? him : null;
        }
    }
}