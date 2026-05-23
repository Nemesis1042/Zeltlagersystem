<?php


$activityRepo = new ActivityRepository();
$participantRepo = new ParticipantRepository();

// GET /activities/?camp_id=1
$router->get('/activities/', function() use ($activityRepo) {
    $camp_id = $_GET['camp_id'] ?? 1;
    $activities = $activityRepo->getByCampId($camp_id);
    return json_encode($activities);
});

// GET /activities/{id}
$router->get('/activities/{id}', function($id) use ($activityRepo) {
    $activity = $activityRepo->getById($id);

    if (!$activity) {
        http_response_code(404);
        return json_encode(['error' => 'Activity not found']);
    }

    return json_encode($activity);
});

// POST /activities/
$router->post('/activities/', function() use ($activityRepo) {
    $data = json_decode(file_get_contents('php://input'), true);
    $camp_id = $_GET['camp_id'] ?? 1;

    if (!isset($data['name'])) {
        http_response_code(400);
        return json_encode(['error' => 'Missing activity name']);
    }

    try {
        $activity_id = $activityRepo->create(
            $camp_id,
            $data['name'],
            $data['description'] ?? '',
            $data['category'] ?? 'hobbygruppe',
            $data['location'] ?? '',
            $data['group_size'] ?? 10
        );

        $activity = $activityRepo->getById($activity_id);

        return json_encode([
            'success' => true,
            'activity_id' => $activity_id,
            'activity' => $activity
        ]);
    } catch (Exception $e) {
        http_response_code(500);
        return json_encode(['error' => $e->getMessage()]);
    }
});

// PATCH /activities/{id}
$router->patch('/activities/{id}', function($id) use ($activityRepo) {
    $data = json_decode(file_get_contents('php://input'), true);

    if (!$activityRepo->update($id, $data)) {
        http_response_code(400);
        return json_encode(['error' => 'Failed to update activity']);
    }

    $activity = $activityRepo->getById($id);
    return json_encode($activity);
});

// DELETE /activities/{id}
$router->delete('/activities/{id}', function($id) use ($activityRepo) {
    if (!$activityRepo->delete($id)) {
        http_response_code(500);
        return json_encode(['error' => 'Failed to delete activity']);
    }

    return json_encode(['success' => true, 'message' => 'Activity deleted']);
});

// GET /activities/{id}/groups
$router->get('/activities/{id}/groups', function($id) use ($activityRepo) {
    $groups = $activityRepo->getGroups($id);

    foreach ($groups as &$group) {
        $group['members'] = $activityRepo->getGroupMembers($group['id']);
    }

    return json_encode($groups);
});

// POST /activities/{id}/generate-groups
$router->post('/activities/{id}/generate-groups', function($id) use ($activityRepo, $participantRepo) {
    $activity = $activityRepo->getById($id);

    if (!$activity) {
        http_response_code(404);
        return json_encode(['error' => 'Activity not found']);
    }

    try {
        // Clear existing groups
        $activityRepo->clearGroups($id);

        // Get all participants for the camp
        $participants = $participantRepo->getByCampId($activity['camp_id']);
        $group_size = $activity['group_size'];
        $num_groups = ceil(count($participants) / $group_size);

        // Shuffle and distribute participants to groups
        shuffle($participants);
        $group_number = 1;

        for ($i = 0; $i < $num_groups; $i++) {
            $group_id = $activityRepo->createGroup($id, $group_number);

            for ($j = 0; $j < $group_size && isset($participants[$i * $group_size + $j]); $j++) {
                $participant_id = $participants[$i * $group_size + $j]['id'];
                $activityRepo->addMemberToGroup($group_id, $participant_id);
            }

            $group_number++;
        }

        return json_encode([
            'success' => true,
            'num_groups' => $num_groups,
            'participants_total' => count($participants),
            'groups' => $activityRepo->getGroups($id)
        ]);
    } catch (Exception $e) {
        http_response_code(500);
        return json_encode(['error' => $e->getMessage()]);
    }
});

// POST /activities/{id}/groups/{group_id}/attendance
$router->post('/activities/{id}/groups/{group_id}/attendance', function($id, $group_id) use ($activityRepo) {
    $data = json_decode(file_get_contents('php://input'), true);

    try {
        foreach ($data as $participant_id => $attended) {
            $activityRepo->recordAttendance($group_id, $participant_id, $attended);
        }

        return json_encode([
            'success' => true,
            'message' => 'Attendance recorded'
        ]);
    } catch (Exception $e) {
        http_response_code(500);
        return json_encode(['error' => $e->getMessage()]);
    }
});

// GET /activities/{id}/groups/{group_id}
$router->get('/activities/{id}/groups/{group_id}', function($id, $group_id) use ($activityRepo) {
    $members = $activityRepo->getGroupMembers($group_id);

    if (empty($members)) {
        http_response_code(404);
        return json_encode(['error' => 'Group not found']);
    }

    return json_encode([
        'group_id' => $group_id,
        'members' => $members
    ]);
});
