import { Request, Response } from "express";
import { User } from "../../entity/Usre";
import { getRepository } from "typeorm";
import { ErrorMessage, MessageResponse } from "../../config/commenResError";
import datasource from "../../connection/db";
import { Photo } from "../../entity/Photo";
import { Employee } from "../../entity/Employee";
import { Question } from "../../entity/Question";
import { Category } from "../../entity/Category";
import { Project } from "../../entity/Project";

const craeteM2m = async (req: Request, res: Response) => {
  try {
    const category1 = new Category();
    category1.name = "animals";
    await datasource.manager.save(category1);

    const category2 = new Category();
    category2.name = "zoo";
    await datasource.manager.save(category2);

    const question = new Question();
    question.title = "dogs";
    question.text = "who let the dogs out?";
    question.categories = [category1, category2];
    await datasource.manager.save(question);
    return MessageResponse(req, res, question, 200);
  } catch (error) {
    return ErrorMessage(req, res, error, 412);
  }
};

const ManyToMany = async (req: Request, res: Response) => {
  try {
    const categoryRepositry = datasource.getRepository(Question);
    const category = await categoryRepositry.find({
      relations: {
        categories: true,
      },
    });
    return MessageResponse(req, res, category, 201);
  } catch (error) {
    console.log(error, "eroo");

    return ErrorMessage(req, res, error, 412);
  }
};

const ProjectToEmployeeM2M = async (req: Request, res: Response) => {
  try {
    const project = new Project();
    project.projectName = req.body.projectName;
    const employeeRepositry = datasource.getRepository(Employee);
    const splitArr = req.body.employeeStr.split(",");

    let pushArr: any = [];

    await Promise.all(
      splitArr.map(async (ele: any, index: any) => {
        const catfind = await employeeRepositry.findOne({
          where: { id: Number(ele) },
        });
        console.log(catfind, "catfind");

        pushArr.push(catfind);
      }),
    );

    console.log(pushArr, "pushArr");
    project.employees = pushArr;

    await datasource.manager.save(project);
    return MessageResponse(req, res, project, 201);
  } catch (error) {
    console.log(error, "eroo");

    return ErrorMessage(req, res, error, 412);
  }
};

export { craeteM2m, ManyToMany, ProjectToEmployeeM2M };