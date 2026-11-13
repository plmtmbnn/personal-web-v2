"use server";

import * as actions from "./tasks";

export async function getTasks(...args: Parameters<typeof actions.getTasks>) {
	return actions.getTasks(...args);
}

export async function getSubtasks(
	...args: Parameters<typeof actions.getSubtasks>
) {
	return actions.getSubtasks(...args);
}

export async function addTask(...args: Parameters<typeof actions.addTask>) {
	return actions.addTask(...args);
}

export async function addSubtask(
	...args: Parameters<typeof actions.addSubtask>
) {
	return actions.addSubtask(...args);
}

export async function addBatchTasks(
	...args: Parameters<typeof actions.addBatchTasks>
) {
	return actions.addBatchTasks(...args);
}

export async function updateTaskStatus(
	...args: Parameters<typeof actions.updateTaskStatus>
) {
	return actions.updateTaskStatus(...args);
}

export async function updateTask(
	...args: Parameters<typeof actions.updateTask>
) {
	return actions.updateTask(...args);
}

export async function reorderTasks(
	...args: Parameters<typeof actions.reorderTasks>
) {
	return actions.reorderTasks(...args);
}

export async function deleteTask(
	...args: Parameters<typeof actions.deleteTask>
) {
	return actions.deleteTask(...args);
}

export async function rescheduleOverdueTasks(
	...args: Parameters<typeof actions.rescheduleOverdueTasks>
) {
	return actions.rescheduleOverdueTasks(...args);
}

export async function archiveTask(
	...args: Parameters<typeof actions.archiveTask>
) {
	return actions.archiveTask(...args);
}

export async function unarchiveTask(
	...args: Parameters<typeof actions.unarchiveTask>
) {
	return actions.unarchiveTask(...args);
}

export async function getArchivedTasks(
	...args: Parameters<typeof actions.getArchivedTasks>
) {
	return actions.getArchivedTasks(...args);
}

export async function addTaskDependency(
	...args: Parameters<typeof actions.addTaskDependency>
) {
	return actions.addTaskDependency(...args);
}

export async function removeTaskDependency(
	...args: Parameters<typeof actions.removeTaskDependency>
) {
	return actions.removeTaskDependency(...args);
}

export async function getTaskDependencies(
	...args: Parameters<typeof actions.getTaskDependencies>
) {
	return actions.getTaskDependencies(...args);
}

export async function getPotentialBlockers(
	...args: Parameters<typeof actions.getPotentialBlockers>
) {
	return actions.getPotentialBlockers(...args);
}
