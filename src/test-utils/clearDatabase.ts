import prisma from "../config/prisma";

export async function clearDatabase() {
    await prisma.answerFeedback.deleteMany();
    await prisma.interviewAnswer.deleteMany();
    await prisma.interviewQuestion.deleteMany();
    await prisma.interviewSession.deleteMany();
    await prisma.resumeSection.deleteMany();
    await prisma.resume.deleteMany();
    await prisma.user.deleteMany();
}
