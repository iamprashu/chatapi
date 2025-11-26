pipeline {
  agent any
  environment {
    IMAGE_NAME = "demoapp:${env.BUILD_NUMBER}"
    NETWORK = "ci-net"
    APP_CONTAINER = "demoapp-${env.BUILD_NUMBER}"
    ZAP_REPORT = "zap-report-${env.BUILD_NUMBER}.html"
    APP_PORT = "3000"
  }
  stages {
    stage('Prepare docker network') {
      steps {
        sh '''
        # create network if not exists
        if ! docker network inspect ${NETWORK} >/dev/null 2>&1; then
          docker network create ${NETWORK}
        fi
        '''
      }
    }

    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Build image') {
      steps {
        sh '''
        docker build -t ${IMAGE_NAME} .
        '''
      }
    }

    stage('Run app for scanning') {
      steps {
        sh '''
        # run container in background on network, internal port only
        docker run -d --name ${APP_CONTAINER} --network ${NETWORK} ${IMAGE_NAME}
        # wait for app to be ready (simple loop)
        for i in $(seq 1 30); do
          # try to reach via curl inside network via another container
          if docker run --rm --network ${NETWORK} busybox wget -qO- http://${APP_CONTAINER}:${APP_PORT} >/dev/null 2>&1; then
            echo "app is up"
            break
          fi
          echo "waiting for app..."
          sleep 2
        done
        '''
      }
    }

    stage('OWASP ZAP scan') {
  steps {
    sh '''
    # Run ZAP baseline scan using the official zaproxy/zap-stable image
    docker run --rm \
      --network ${NETWORK} \
      -v $(pwd):/zap/wrk/:rw \
      zaproxy/zap-stable \
      /zap/zap-baseline.py -t http://${APP_CONTAINER}:${APP_PORT} -r /zap/wrk/${ZAP_REPORT} -I
    '''
  }
  post {
    always {
      archiveArtifacts artifacts: "${ZAP_REPORT}", allowEmptyArchive: true
      publishHTML([
        allowMissing: false,
        alwaysLinkToLastBuild: true,
        keepAll: true,
        reportDir: '.',
        reportFiles: "${ZAP_REPORT}",
        reportName: 'OWASP ZAP Report'
      ])
    }
  }
}


    stage('Stop test container') {
      steps {
        sh '''
        docker rm -f ${APP_CONTAINER} || true
        '''
      }
    }

    stage('If clean, tag & deploy') {
      when {
        expression {
          // simple check: abort if ZAP found high-risk alerts. Here we parse the HTML for "High"
          def html = readFile "${ZAP_REPORT}"
          // crude check, can be improved by parsing JSON report
          return !(html.contains(">High<"))  // proceed only if no "High" in report
        }
      }
      steps {
        sh '''
        # tag to "latest" or push to registry here if needed
        docker tag ${IMAGE_NAME} demoapp:latest

        # stop any existing deployed container and run new one (host network port mapping)
        if docker ps -a --format "{{.Names}}" | grep -w deployed-demoapp >/dev/null 2>&1; then
          docker rm -f deployed-demoapp || true
        fi
        docker run -d --name deployed-demoapp -p 8080:3000 ${IMAGE_NAME}
        '''
      }
    }
  }

  post {
    always {
      sh 'docker image prune -f || true'
    }
    failure {
      echo "Pipeline failed. See logs."
    }
  }
}
