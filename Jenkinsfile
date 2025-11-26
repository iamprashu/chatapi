pipeline {
  agent any

  environment {
    IMAGE_NAME = "demoapp:${env.BUILD_NUMBER}"
    DEP_REPORT_DIR = "dc-report"
    DEP_REPORT_HTML = "dependency-check-report.html"
    DEP_REPORT_XML = "dependency-check-report.xml"
    APP_CONTAINER = "demoapp-${env.BUILD_NUMBER}"
  }

  stages {

    stage('Checkout Code') {
      steps {
        checkout scm
      }
    }

    stage('Build Docker Image') {
      steps {
        sh '''
          echo "Building Docker image..."
          docker build -t ${IMAGE_NAME} .
        '''
      }
    }

    stage('OWASP Dependency-Check Scan') {
      steps {
        sh '''
          # Create output folder for reports
          mkdir -p ${DEP_REPORT_DIR}

          # Run OWASP Dependency-Check using Docker
          docker run --rm \
            -v $(pwd):/src \
            -v $(pwd)/${DEP_REPORT_DIR}:/report \
            owasp/dependency-check \
            --scan /src \
            --format ALL \
            --out /report
        '''
      }
      post {
        always {
          archiveArtifacts artifacts: "${DEP_REPORT_DIR}/*.html", allowEmptyArchive: true
          archiveArtifacts artifacts: "${DEP_REPORT_DIR}/*.xml", allowEmptyArchive: true
        }
        failure {
          echo "Dependency Check failed — vulnerabilities found!"
        }
      }
    }

    stage('Fail on High Vulnerabilities') {
      steps {
        script {
          def xml = readFile("${DEP_REPORT_DIR}/${DEP_REPORT_XML}")
          if (xml.contains("<severity>High</severity>")) {
            error("High severity vulnerabilities detected — Deployment blocked")
          } else {
            echo "No High vulnerabilities found"
          }
        }
      }
    }

    stage('Deploy Application') {
      steps {
        sh '''
          echo "Deploying app container..."

          # Stop old container if exists
          if docker ps -a --format "{{.Names}}" | grep -w deployed-demoapp; then
            docker rm -f deployed-demoapp || true
          fi

          # Run new container
          docker run -d --name deployed-demoapp -p 8080:3000 ${IMAGE_NAME}
        '''
      }
    }

  } 

  post {
    always {
      sh 'docker image prune -f || true'
    }
    success {
      echo "� Pipeline completed successfully!"
    }
  }

}
