import { Router } from "express";

const route = Router();

// 모든 글 조회
route.get("/", (req, res) => {});

// 글 상세 조회
route.get("/:id", (req, res) => {});

// 글 생성
route.post("/", (req, res) => {});

// 글 수정
route.put("/:id", (req, res) => {});

// 글 삭제
route.delete("/:id", (req, res) => {});

export default route;