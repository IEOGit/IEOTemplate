using Microsoft.IdentityModel.Tokens;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Web;
using System.Web.Mvc;
using WebApplication4.Models;


namespace WebApplication4.Controllers
{
    public class LoginController : Controller
    {

        private Admin_visoresEntities db = new Admin_visoresEntities();

        // GET: Login
        public ActionResult Index()
        {
            return View();
        }


        [HttpPost]
        public string getUSerToken(string email, string password)
        {

            //https://www.variablenotfound.com/2017/12/autenticacion-jwt-en-apis-con-aspnet.html

            var user = db.Users.Where(x => x.email == email).FirstOrDefault();
            if (user != null)
            {
                string encpass = GenerateToken(password);
                if (encpass == user.password)
                {
                    //return GenerateToken(email);
                    return "RESPONSE_" + GenerateToken(email);
                }
                else
                {
                    return "Wrong password";
                }
            }
            else
            {
                return "Wrong user";
            }
        }

        [HttpPost]
        public string getRoleToken(string usertoken, int appid)
        {

            //https://www.variablenotfound.com/2017/12/autenticacion-jwt-en-apis-con-aspnet.html




            foreach (Users userx in db.Users)
            {
                string encemail = GenerateToken(userx.email);
                if (encemail == usertoken)
                {
                    var permit = userx.User_Prj_Role.Where(x => x.id_project == appid).FirstOrDefault();
                    if (permit != null)
                    {
                        return permit.Roles.rol;
                    }
                    else
                    {
                        return "0";
                    }

                }
            }

            return "Wrong user";



        }

        private string GenerateToken(string username)
        {
            var header = new System.IdentityModel.Tokens.Jwt.JwtHeader(
                new SigningCredentials(
                    new SymmetricSecurityKey(
                        Encoding.UTF8.GetBytes("-Rh9?3B-L36szv??")
                    ),
                    SecurityAlgorithms.HmacSha256)
            );

            //var payload = new JwtPayload(
            //    issuer: "MyServer",
            //    audience: "MyWebApp",
            //    claims: claims,
            //    notBefore: DateTime.Now,
            //    expires: DateTime.Now.AddHours(1)
            //);

            var claims = new Claim[]
            {
            new Claim(JwtRegisteredClaimNames.UniqueName, username),
            };
            var payload = new JwtPayload(claims);

            var token = new JwtSecurityToken(header, payload);
            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        [HttpPost]
        public string isWidgetAllowed(string usertoken, int appid,string id_widget)

        {
            
            Users logeduser = getUserByToken(usertoken);

            if (logeduser != null)
            {
                int userapprole = db.User_Prj_Role.Where(x => x.id_project == appid && x.id_user == logeduser.id).FirstOrDefault().id_rol;
                widgets w = db.widgets.Find(id_widget);
                if (w == null)
                {
                    return "true";
                }
                else {
                    if (userapprole <= w.min_role)
                    {
                        return "true";
                    }
                    else {
                        return "false";
                    }
                }
            }
            else
            {
                if (db.widgets.Find(id_widget) != null)
                {
                    return "false";
                }
                else {
                    return "true";
                }
            }

        }

        private Users getUserByToken(string usertoken)
        {
            foreach (Users user in db.Users)
            {
                if (usertoken == user.usertoken)
                {
                    return user;
                }
            }
            return null;
        }
    }
}