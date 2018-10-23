using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity;
using System.Linq;
using System.Net;
using System.Web;
using System.Web.Mvc;
using WebApplication4.Models;

namespace WebApplication4.Controllers
{
    [Authorize]
    public class User_Prj_RoleController : Controller
    {
        private Admin_visoresEntities db = new Admin_visoresEntities();

        // GET: User_Prj_Role
        public ActionResult Index()
        {
            var user_Prj_Role = db.User_Prj_Role.Include(u => u.Projects).Include(u => u.Roles).Include(u => u.Users);
            return View(user_Prj_Role.ToList());
        }

        // GET: User_Prj_Role/Details/5
        public ActionResult Details(int? id)
        {
            if (id == null)
            {
                return new HttpStatusCodeResult(HttpStatusCode.BadRequest);
            }
            User_Prj_Role user_Prj_Role = db.User_Prj_Role.Find(id);
            if (user_Prj_Role == null)
            {
                return HttpNotFound();
            }
            return View(user_Prj_Role);
        }

        // GET: User_Prj_Role/Create
        public ActionResult Create()
        {
            ViewBag.id_project = new SelectList(db.Projects, "id", "project");
            ViewBag.id_rol = new SelectList(db.Roles, "id", "rol");
            ViewBag.id_user = new SelectList(db.Users, "id", "email");
            return View();
        }

        // POST: User_Prj_Role/Create
        // To protect from overposting attacks, please enable the specific properties you want to bind to, for 
        // more details see http://go.microsoft.com/fwlink/?LinkId=317598.
        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult Create([Bind(Include = "id_user,id_project,id_rol,id")] User_Prj_Role user_Prj_Role)
        {
            if (ModelState.IsValid)
            {
                db.User_Prj_Role.Add(user_Prj_Role);
                db.SaveChanges();
                return RedirectToAction("Index");
            }

            ViewBag.id_project = new SelectList(db.Projects, "id", "project", user_Prj_Role.id_project);
            ViewBag.id_rol = new SelectList(db.Roles, "id", "rol", user_Prj_Role.id_rol);
            ViewBag.id_user = new SelectList(db.Users, "id", "email", user_Prj_Role.id_user);
            return View(user_Prj_Role);
        }

        // GET: User_Prj_Role/Edit/5
        public ActionResult Edit(int? id)
        {
            if (id == null)
            {
                return new HttpStatusCodeResult(HttpStatusCode.BadRequest);
            }
            User_Prj_Role user_Prj_Role = db.User_Prj_Role.Find(id);
            if (user_Prj_Role == null)
            {
                return HttpNotFound();
            }
            ViewBag.id_project = new SelectList(db.Projects, "id", "project", user_Prj_Role.id_project);
            ViewBag.id_rol = new SelectList(db.Roles, "id", "rol", user_Prj_Role.id_rol);
            ViewBag.id_user = new SelectList(db.Users, "id", "email", user_Prj_Role.id_user);
            return View(user_Prj_Role);
        }

        // POST: User_Prj_Role/Edit/5
        // To protect from overposting attacks, please enable the specific properties you want to bind to, for 
        // more details see http://go.microsoft.com/fwlink/?LinkId=317598.
        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult Edit([Bind(Include = "id_user,id_project,id_rol,id")] User_Prj_Role user_Prj_Role)
        {
            if (ModelState.IsValid)
            {
                db.Entry(user_Prj_Role).State = EntityState.Modified;
                db.SaveChanges();
                return RedirectToAction("Index");
            }
            ViewBag.id_project = new SelectList(db.Projects, "id", "project", user_Prj_Role.id_project);
            ViewBag.id_rol = new SelectList(db.Roles, "id", "rol", user_Prj_Role.id_rol);
            ViewBag.id_user = new SelectList(db.Users, "id", "email", user_Prj_Role.id_user);
            return View(user_Prj_Role);
        }

        // GET: User_Prj_Role/Delete/5
        public ActionResult Delete(int? id)
        {
            if (id == null)
            {
                return new HttpStatusCodeResult(HttpStatusCode.BadRequest);
            }
            User_Prj_Role user_Prj_Role = db.User_Prj_Role.Find(id);
            if (user_Prj_Role == null)
            {
                return HttpNotFound();
            }
            return View(user_Prj_Role);
        }

        // POST: User_Prj_Role/Delete/5
        [HttpPost, ActionName("Delete")]
        [ValidateAntiForgeryToken]
        public ActionResult DeleteConfirmed(int id)
        {
            User_Prj_Role user_Prj_Role = db.User_Prj_Role.Find(id);
            db.User_Prj_Role.Remove(user_Prj_Role);
            db.SaveChanges();
            return RedirectToAction("Index");
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }
    }
}
